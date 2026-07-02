package com.docpilot.backend.controller;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.exception.ResourceNotFoundException;
import com.docpilot.backend.repository.UserRepository;
import com.docpilot.backend.security.UserPrincipal;
import com.docpilot.backend.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Document Management", description = "Endpoints for uploading, listing, viewing, downloading, and deleting documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document (PDF, PNG, JPG, JPEG, TIFF)")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Document document = documentService.uploadDocument(file, user);
        return new ResponseEntity<>(document, HttpStatus.ACCEPTED);
    }

    @GetMapping
    @Operation(summary = "Get list of uploaded documents")
    public ResponseEntity<Page<Document>> getDocuments(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Document> docs = documentService.getDocuments(query, status, pageable);
        return ResponseEntity.ok(docs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata and raw OCR text by ID")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download physical document file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id, HttpServletRequest request) {
        Resource resource = documentService.loadFileAsResource(id);
        
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            System.out.println("Could not determine file type.");
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        Document document = documentService.getDocumentById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Delete document file and metadata (Admin and Manager only)")
    public ResponseEntity<String> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.deleteDocument(id, userPrincipal.getUsername());
        return ResponseEntity.ok("Document deleted successfully");
    }
}
