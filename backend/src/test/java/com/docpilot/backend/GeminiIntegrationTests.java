package com.docpilot.backend;

import com.docpilot.backend.entity.*;
import com.docpilot.backend.repository.DocumentDataRepository;
import com.docpilot.backend.repository.DocumentRepository;
import com.docpilot.backend.repository.UserRepository;
import com.docpilot.backend.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "app.gemini.api-key=",
    "app.pinecone.mock=true"
})
@ActiveProfiles("test")
@Transactional
public class GeminiIntegrationTests {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentDataRepository documentDataRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        documentDataRepository.deleteAll();
        documentRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .username("analyst")
                .email("analyst@docpilot.com")
                .password("password")
                .role(Role.ROLE_EMPLOYEE)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    public void testExtractionAutoApproveForInvoice() {
        // Create document mimicking mock invoice structure
        Document doc = Document.builder()
                .originalFilename("test-invoice-acme.pdf")
                .storedFilename("uuid-invoice.pdf")
                .filePath("some/path/invoice.pdf")
                .fileType("pdf")
                .fileSize(1000L)
                .status(DocumentStatus.OCR_COMPLETED)
                .rawText("Vendor Name: ACME Industrial Supplies Ltd.\nTotal Amount Due: $12,980.00\nDue Date: 2026-07-15\nCurrency: USD")
                .uploadedBy(testUser)
                .build();
        doc = documentRepository.save(doc);

        geminiService.extractMetadata(doc.getId());

        // Verify database populated with extracted fields
        DocumentData data = documentDataRepository.findByDocumentId(doc.getId()).orElse(null);
        assertThat(data).isNotNull();
        assertThat(data.getVendor()).isEqualTo("ACME Industrial Supplies Ltd.");
        assertThat(data.getAmount()).isEqualByComparingTo("12980.00");
        assertThat(data.getCategory()).isEqualTo("INVOICE");
        assertThat(data.getStatus()).isEqualTo("EXTRACTED"); // Auto-approved confidence

        // Verify document is automatically APPROVED
        Document updatedDoc = documentRepository.findById(doc.getId()).orElse(null);
        assertThat(updatedDoc).isNotNull();
        assertThat(updatedDoc.getStatus()).isEqualTo(DocumentStatus.APPROVED);
    }

    @Test
    public void testExtractionNeedsReviewForResume() {
        // Create document mimicking mock resume structure
        Document doc = Document.builder()
                .originalFilename("test-resume.pdf")
                .storedFilename("uuid-resume.pdf")
                .filePath("some/path/resume.pdf")
                .fileType("pdf")
                .fileSize(1000L)
                .status(DocumentStatus.OCR_COMPLETED)
                .rawText("Candidate Name: John Doe\nEmail: john@email.com")
                .uploadedBy(testUser)
                .build();
        doc = documentRepository.save(doc);

        geminiService.extractMetadata(doc.getId());

        // Verify database populated with extracted fields
        DocumentData data = documentDataRepository.findByDocumentId(doc.getId()).orElse(null);
        assertThat(data).isNotNull();
        assertThat(data.getVendor()).isEqualTo("John Doe");
        assertThat(data.getCategory()).isEqualTo("RESUME");
        assertThat(data.getStatus()).isEqualTo("NEEDS_REVIEW"); // Review triggered by low confidence

        // Verify parent document stays OCR_COMPLETED (awaiting manual review)
        Document updatedDoc = documentRepository.findById(doc.getId()).orElse(null);
        assertThat(updatedDoc).isNotNull();
        assertThat(updatedDoc.getStatus()).isEqualTo(DocumentStatus.OCR_COMPLETED);
    }
}
