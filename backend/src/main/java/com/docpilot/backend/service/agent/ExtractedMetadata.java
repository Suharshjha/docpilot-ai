package com.docpilot.backend.service.agent;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedMetadata {
    private String vendor;
    private String invoiceNumber;
    private String gst;
    private java.math.BigDecimal amount;
    private String dueDate;
    private String currency;
    private String category;
    private String summary;
    
    private Double vendorConfidence;
    private Double invoiceNumberConfidence;
    private Double amountConfidence;
    private Double dueDateConfidence;
    private Double categoryConfidence;
}
