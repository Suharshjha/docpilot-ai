package com.docpilot.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "document_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DocumentData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @Column(length = 100)
    private String vendor;

    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(length = 50)
    private String gst;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 10)
    private String currency;

    @Column(length = 50)
    private String category;

    @Column(name = "confidence_score", columnDefinition = "TEXT")
    private String confidenceScore; // JSON-formatted string of field confidence

    @Column(nullable = false, length = 30)
    private String status; // PENDING, NEEDS_REVIEW, EXTRACTED
}
