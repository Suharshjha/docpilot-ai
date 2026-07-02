package com.docpilot.backend;

import com.docpilot.backend.dto.ChatRequest;
import com.docpilot.backend.dto.ChatResponse;
import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.entity.Role;
import com.docpilot.backend.repository.DocumentRepository;
import com.docpilot.backend.repository.UserRepository;
import com.docpilot.backend.service.RAGService;
import com.docpilot.backend.service.VectorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
    "app.gemini.api-key=",
    "app.pinecone.mock=true"
})
@ActiveProfiles("test")
@Transactional
public class RAGIntegrationTests {

    @Autowired
    private VectorService vectorService;

    @Autowired
    private RAGService rAGService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        // Clear in-memory mock vectors to isolate test environments
        VectorService.IN_MEMORY_VECTORS.clear();

        testUser = userRepository.findByUsername("admin").orElse(null);
        if (testUser == null) {
            testUser = User.builder()
                    .username("admin")
                    .email("admin@docpilot.ai")
                    .password("admin123")
                    .role(Role.ROLE_ADMIN)
                    .build();
            testUser = userRepository.save(testUser);
        }
    }

    @Test
    public void testTextChunkingLogic() {
        String longText = "This is a sentence. This is another sentence. We are testing how sliding window character chunking slices text into smaller blocks with a specified overlap margin.";
        List<String> chunks = vectorService.chunkText(longText);

        assertNotNull(chunks);
        assertFalse(chunks.isEmpty());
        assertTrue(chunks.get(0).length() <= 500);

        // Verification of overlapping characters if multiple chunks are generated
        if (chunks.size() > 1) {
            String c0 = chunks.get(0);
            String c1 = chunks.get(1);
            // Verify that the end of c0 overlaps with the start of c1
            String c0End = c0.substring(c0.length() - 50);
            String c1Start = c1.substring(0, 50);
            assertNotEquals(-1, c0End.indexOf(c1Start.substring(0, 10)));
        }
    }

    @Test
    public void testVectorRecordIndexingAndRetrieval() {
        Document doc = Document.builder()
                .originalFilename("invoice_test_rag.pdf")
                .storedFilename("test_rag.pdf")
                .filePath("docpilot-ai/storage/documents/test_rag.pdf")
                .fileType("pdf")
                .fileSize(1024L)
                .status(DocumentStatus.APPROVED)
                .uploadedBy(testUser)
                .rawText("This document contains invoice information for ACME Corp billing for custom Web design services totaling $12,980.00.")
                .build();
        doc = documentRepository.save(doc);

        // Index the document chunks
        vectorService.indexDocumentSync(doc.getId());

        assertFalse(VectorService.IN_MEMORY_VECTORS.isEmpty(), "In-memory database should contain indexed mock records");
        
        VectorService.VectorRecord record = VectorService.IN_MEMORY_VECTORS.get(0);
        assertEquals(doc.getId(), record.getDocumentId());
        assertEquals("invoice_test_rag.pdf", record.getFilename());
        assertTrue(record.getText().contains("ACME Corp"));

        // Query test
        List<Double> queryEmbedding = vectorService.getEmbedding("ACME Corp billing");
        List<VectorService.VectorRecord> matches = vectorService.queryVectors(queryEmbedding, 3);

        assertFalse(matches.isEmpty());
        assertEquals(doc.getId(), matches.get(0).getDocumentId());
    }

    @Test
    public void testRAGChatResponse() {
        Document doc = Document.builder()
                .originalFilename("resume_test.pdf")
                .storedFilename("resume_test.pdf")
                .filePath("docpilot-ai/storage/documents/resume_test.pdf")
                .fileType("pdf")
                .fileSize(1024L)
                .status(DocumentStatus.APPROVED)
                .uploadedBy(testUser)
                .rawText("Candidate Profile: Suharsh Kumar is a Senior Java developer skilled in Spring Boot, React, and MySQL databases.")
                .build();
        doc = documentRepository.save(doc);
        vectorService.indexDocumentSync(doc.getId());

        ChatRequest request = new ChatRequest("What are Suharsh Kumar's credentials?");
        ChatResponse response = rAGService.askCopilot(request);

        assertNotNull(response);
        assertNotNull(response.getAnswer());
        assertFalse(response.getCitations().isEmpty());

        ChatResponse.Citation citation = response.getCitations().get(0);
        assertEquals(doc.getId(), citation.getDocumentId());
        assertEquals("resume_test.pdf", citation.getFilename());
    }
}
