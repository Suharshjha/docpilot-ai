package com.docpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeminiExtractionResponse {
    private String vendor;
    private String invoiceNumber;
    private String gst;
    private BigDecimal amount;
    private String dueDate; // ISO date string (YYYY-MM-DD)
    private String currency;
    private String category; // INVOICE, RESUME, PURCHASE_ORDER, CONTRACT, OTHER
    private String summary;  // 2-3 sentence executive summary

    // Confidence scores (0.0 to 1.0)
    private Double vendorConfidence;
    private Double invoiceNumberConfidence;
    private Double amountConfidence;
    private Double dueDateConfidence;
    private Double categoryConfidence;
}
