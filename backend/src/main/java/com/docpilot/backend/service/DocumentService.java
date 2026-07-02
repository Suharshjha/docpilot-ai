package com.docpilot.backend.service;

import com.docpilot.backend.config.FileStorageConfig;
import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.exception.FileStorageException;
import com.docpilot.backend.exception.ResourceNotFoundException;
import com.docpilot.backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FileStorageConfig fileStorageConfig;

    @Autowired
    private OcrService ocrService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public Document uploadDocument(MultipartFile file, User user) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot upload an empty file: " + originalFilename);
        }

        String fileExtension = getFileExtension(originalFilename);
        if (!isValidExtension(fileExtension)) {
            throw new FileStorageException("Unsupported file type: ." + fileExtension + ". Only PDF and images are allowed.");
        }

        try {
            LocalDateTime now = LocalDateTime.now();
            String datePath = String.format("%d/%02d/%02d", now.getYear(), now.getMonthValue(), now.getDayOfMonth());
            Path targetDir = fileStorageConfig.getUploadPath().resolve(datePath);
            Files.createDirectories(targetDir);

            String storedFilename = UUID.randomUUID().toString() + "." + fileExtension;
            Path targetLocation = targetDir.resolve(storedFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Document document = Document.builder()
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .filePath(targetLocation.toString())
                    .fileType(fileExtension)
                    .fileSize(file.getSize())
                    .status(DocumentStatus.PENDING)
                    .uploadedBy(user)
                    .build();

            Document savedDoc = documentRepository.save(document);

            auditService.log("UPLOAD", user.getUsername(), "Uploaded document: " + originalFilename + " (ID: " + savedDoc.getId() + ")");

            if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
                org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                    new org.springframework.transaction.support.TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            ocrService.processOcrAsync(savedDoc.getId());
                        }
                    }
                );
            } else {
                ocrService.processOcrAsync(savedDoc.getId());
            }

            return savedDoc;

        } catch (IOException e) {
            throw new FileStorageException("Could not store file " + originalFilename + ". Please try again!", e);
        }
    }

    public Page<Document> getDocuments(String query, DocumentStatus status, Pageable pageable) {
        return documentRepository.searchDocuments(query, status, pageable);
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    public Resource loadFileAsResource(Long documentId) {
        Document document = getDocumentById(documentId);
        try {
            Path filePath = Paths.get(document.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk: " + document.getOriginalFilename());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path URI is invalid: " + ex.getMessage());
        }
    }

    @Transactional
    public void deleteDocument(Long id, String adminUsername) {
        Document document = getDocumentById(id);
        
        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println(">>> Failed to delete physical file from disk: " + document.getFilePath());
        }

        documentRepository.delete(document);
        
        auditService.log("DELETE", adminUsername, "Deleted document: " + document.getOriginalFilename() + " (ID: " + id + ")");
    }

    private String getFileExtension(String filename) {
        int lastIndexOf = filename.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return "";
        }
        return filename.substring(lastIndexOf + 1).toLowerCase();
    }

    private boolean isValidExtension(String ext) {
        return ext.equals("pdf") || ext.equals("png") || ext.equals("jpg") || ext.equals("jpeg") || ext.equals("tiff") || ext.equals("tif");
    }
}
