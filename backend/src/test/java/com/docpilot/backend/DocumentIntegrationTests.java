package com.docpilot.backend;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.entity.Role;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.repository.DocumentRepository;
import com.docpilot.backend.repository.UserRepository;
import com.docpilot.backend.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DocumentIntegrationTests {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        documentRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .username("uploader")
                .email("uploader@docpilot.com")
                .password("password")
                .role(Role.ROLE_EMPLOYEE)
                .build();
        testUser = userRepository.save(testUser);
    }

    @Test
    public void testUploadDocumentSuccess() throws IOException {
        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                "test-invoice.pdf",
                "application/pdf",
                "Dummy PDF content".getBytes()
        );

        Document doc = documentService.uploadDocument(multipartFile, testUser);

        assertThat(doc).isNotNull();
        assertThat(doc.getOriginalFilename()).isEqualTo("test-invoice.pdf");
        assertThat(doc.getFileType()).isEqualTo("pdf");
        assertThat(doc.getStatus()).isEqualTo(DocumentStatus.PENDING);
        assertThat(doc.getUploadedBy().getUsername()).isEqualTo("uploader");

        // Verify it was stored physically
        assertThat(Files.exists(Paths.get(doc.getFilePath()))).isTrue();

        // Clean up stored file
        Files.deleteIfExists(Paths.get(doc.getFilePath()));
    }
}
