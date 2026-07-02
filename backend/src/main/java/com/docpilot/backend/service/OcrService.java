package com.docpilot.backend.service;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import com.docpilot.backend.repository.DocumentRepository;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.image.BufferedImage;
import java.io.File;
import java.time.LocalDateTime;

@Service
public class OcrService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private GeminiService geminiService;

    @Value("${app.ocr.tessdata-path:C:/Program Files/Tesseract-OCR/tessdata}")
    private String tessdataPath;

    @Value("${app.ocr.mock:false}")
    private boolean ocrMock;

    @Async("ocrTaskExecutor")
    @Transactional
    public void processOcrAsync(Long documentId) {
        long startTime = System.currentTimeMillis();
        
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return;
        }

        document.setStatus(DocumentStatus.PROCESSING);
        documentRepository.saveAndFlush(document);
        
        auditService.log("OCR_START", "System", "Started OCR processing for document: " + document.getOriginalFilename());

        try {
            String extractedText = "";

            if (ocrMock) {
                // Simulate natural processing delay
                Thread.sleep(2500);
                extractedText = generateMockOcrText(document.getOriginalFilename());
            } else {
                File docFile = new File(document.getFilePath());
                Tesseract tesseract = new Tesseract();
                File tessDir = new File(tessdataPath);
                if (tessDir.exists()) {
                    tesseract.setDatapath(tessdataPath);
                } else {
                    System.out.println(">>> Tessdata directory not found at " + tessdataPath + ". Using system configuration.");
                }
                tesseract.setLanguage("eng");

                if (document.getFileType().equalsIgnoreCase("pdf") || document.getFileType().contains("pdf")) {
                    // Render PDF to page images and apply OCR
                    StringBuilder sb = new StringBuilder();
                    try (PDDocument pdDoc = Loader.loadPDF(docFile)) {
                        PDFRenderer pdfRenderer = new PDFRenderer(pdDoc);
                        int pageCount = pdDoc.getNumberOfPages();
                        for (int page = 0; page < pageCount; page++) {
                            BufferedImage bim = pdfRenderer.renderImageWithDPI(page, 300);
                            String pageText = tesseract.doOCR(bim);
                            sb.append(pageText).append("\n");
                        }
                    }
                    extractedText = sb.toString();
                } else {
                    // Process image file directly
                    extractedText = tesseract.doOCR(docFile);
                }
            }

            long endTime = System.currentTimeMillis();
            
            document.setRawText(extractedText);
            document.setStatus(DocumentStatus.OCR_COMPLETED);
            document.setProcessingTimeMs(endTime - startTime);
            documentRepository.save(document);
            
            auditService.log("OCR_SUCCESS", "System", 
                    String.format("Successfully completed OCR for document: %s. Character count: %d, Time taken: %d ms", 
                            document.getOriginalFilename(), extractedText.length(), document.getProcessingTimeMs()));

            // Trigger structured metadata extraction automatically
            geminiService.extractMetadata(document.getId());

        } catch (Throwable e) {
            long endTime = System.currentTimeMillis();
            
            document.setStatus(DocumentStatus.OCR_FAILED);
            document.setProcessingTimeMs(endTime - startTime);
            documentRepository.save(document);
            
            auditService.log("OCR_FAILURE", "System", 
                    String.format("OCR processing failed for document: %s. Error: %s", 
                            document.getOriginalFilename(), e.getMessage()));
            System.err.println(">>> OCR Service error: " + e.getMessage());
        }
    }

    private String generateMockOcrText(String filename) {
        String lowerName = filename.toLowerCase();
        if (lowerName.contains("invoice") || lowerName.contains("bill") || lowerName.contains("receipt")) {
            return "--- DOCPILOT AI MOCK INVOICE --- \n" +
                   "Vendor Name: ACME Industrial Supplies Ltd.\n" +
                   "GST Number: GST9876543210\n" +
                   "Invoice Number: INV-2026-0042\n" +
                   "Date: 2026-06-15\n" +
                   "Due Date: 2026-07-15\n" +
                   "Currency: USD\n" +
                   "-------------------------------------------\n" +
                   "Item 1: Enterprise Cloud Security Pack - Qty: 1 - Price: $8,500.00\n" +
                   "Item 2: API Gateway Integration Support - Qty: 1 - Price: $2,500.00\n" +
                   "-------------------------------------------\n" +
                   "Subtotal: $11,000.00\n" +
                   "Tax (GST 18%): $1,980.00\n" +
                   "Total Amount Due: $12,980.00\n" +
                   "-------------------------------------------";
        } else if (lowerName.contains("resume") || lowerName.contains("cv") || lowerName.contains("profile") || lowerName.contains("candidate")) {
            return "--- DOCPILOT AI MOCK RESUME --- \n" +
                   "Candidate Name: John Doe\n" +
                   "Email: john.doe@email.com\n" +
                   "Phone: +1-555-0199\n" +
                   "Position: Senior Full-Stack Java & React Developer\n" +
                   "Experience: 8 Years\n" +
                   "-------------------------------------------\n" +
                   "Technical Skills:\n" +
                   "- Java 17, Spring Boot, Spring Security, Hibernate\n" +
                   "- React, Redux, Material-UI, Tailwind CSS\n" +
                   "- Docker, Kubernetes, MySQL, PostgreSQL, AWS\n" +
                   "-------------------------------------------\n" +
                   "Education:\n" +
                   "- Master of Computer Applications (MCA) - XYZ University\n" +
                   "-------------------------------------------\n" +
                   "Summary:\n" +
                   "Highly motivated engineer specializing in building high-throughput scalable backend microservices and modern responsive user interfaces.";
        } else if (lowerName.contains("po") || lowerName.contains("purchase order") || lowerName.contains("order")) {
            return "--- DOCPILOT AI MOCK PURCHASE ORDER --- \n" +
                   "Buyer: Globex Corporation\n" +
                   "PO Number: PO-998877\n" +
                   "Vendor: ACME Industrial Supplies Ltd.\n" +
                   "PO Date: 2026-06-10\n" +
                   "-------------------------------------------\n" +
                   "Please supply the following items:\n" +
                   "Item 1: Workstation Pro Laptops - Qty: 5 - Unit Price: $1,500.00 - Total: $7,500.00\n" +
                   "Item 2: UltraWide Monitors 34\" - Qty: 5 - Unit Price: $500.00 - Total: $2,500.00\n" +
                   "-------------------------------------------\n" +
                   "Grand Total: $10,000.00\n" +
                   "Shipping Address: 100 Innovation Way, Tech Park, Suite 400\n" +
                   "Authorized Signature: Globex Procurement Manager Team";
        } else {
            return "--- DOCPILOT AI MOCK CONTRACT / DOCUMENT --- \n" +
                   "Document Title: Non-Disclosure Agreement (NDA)\n" +
                   "Parties: DocPilot AI Systems Inc. and Suharsh Kumar (Contractor)\n" +
                   "Effective Date: 2026-07-01\n" +
                   "-------------------------------------------\n" +
                   "This Non-Disclosure Agreement (the \"Agreement\") is entered into to prevent the unauthorized disclosure of Confidential Information as defined below.\n" +
                   "1. Confidential Information: Information relating to the proprietary software DocPilot AI product architectures, Spring Boot repositories, and Gemini Pinecone vector index settings.\n" +
                   "2. Term: This agreement shall remain in effect for 3 years from the Effective Date.\n" +
                   "-------------------------------------------\n" +
                   "Signed for DocPilot AI Systems: Admin Team\n" +
                   "Signed for Contractor: Suharsh Kumar";
        }
    }
}
