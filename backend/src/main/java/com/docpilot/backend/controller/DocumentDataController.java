package com.docpilot.backend.controller;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentData;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.exception.ResourceNotFoundException;
import com.docpilot.backend.repository.DocumentDataRepository;
import com.docpilot.backend.repository.DocumentRepository;
import com.docpilot.backend.security.UserPrincipal;
import com.docpilot.backend.service.AuditService;
import com.docpilot.backend.service.VectorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents/{id}/data")
@Tag(name = "Document Metadata Extraction", description = "Endpoints for retrieving and reviewing extracted document fields")
public class DocumentDataController {

    @Autowired
    private DocumentDataRepository documentDataRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private VectorService vectorService;

    @GetMapping
    @Operation(summary = "Get extracted structured fields and confidence scores by document ID")
    public ResponseEntity<DocumentData> getDocumentData(@PathVariable Long id) {
        documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        DocumentData data = documentDataRepository.findByDocumentId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Extracted data not found for document ID: " + id));

        return ResponseEntity.ok(data);
    }

    @PutMapping
    @Operation(summary = "Manually update and approve document metadata (Human-in-the-loop review)")
    public ResponseEntity<DocumentData> updateAndApproveDocumentData(
            @PathVariable Long id,
            @RequestBody DocumentData updateRequest,
            @RequestParam(defaultValue = "APPROVED") String decision,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        DocumentData data = documentDataRepository.findByDocumentId(id)
                .orElseGet(() -> {
                    DocumentData newData = new DocumentData();
                    newData.setDocument(document);
                    newData.setStatus("PENDING");
                    newData.setConfidenceScore("{}");
                    return newData;
                });

        data.setVendor(updateRequest.getVendor());
        data.setInvoiceNumber(updateRequest.getInvoiceNumber());
        data.setGst(updateRequest.getGst());
        data.setAmount(updateRequest.getAmount());
        data.setDueDate(updateRequest.getDueDate());
        data.setCurrency(updateRequest.getCurrency());
        data.setCategory(updateRequest.getCategory());
        data.setStatus("EXTRACTED");

        DocumentData savedData = documentDataRepository.save(data);

        if (decision.equalsIgnoreCase("REJECTED")) {
            document.setStatus(DocumentStatus.REJECTED);
            auditService.log("MANUAL_REJECT", userPrincipal.getUsername(), 
                    "Manually rejected document: " + document.getOriginalFilename());
        } else {
            document.setStatus(DocumentStatus.APPROVED);
            auditService.log("MANUAL_APPROVE", userPrincipal.getUsername(), 
                    "Manually approved document data for: " + document.getOriginalFilename());
            vectorService.indexDocumentAsync(document.getId());
        }
        documentRepository.save(document);

        return ResponseEntity.ok(savedData);
    }
}
