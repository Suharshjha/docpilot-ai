package com.docpilot.backend.service.agent;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface ExtractionAgent {

    @SystemMessage({
        "You are an Extraction & Classification Agent.",
        "Your task is to take the raw OCR text of a document, extract the structured metadata, classify the document type, and compute confidence scores for each extracted field.",
        "Required fields to extract:",
        "- vendor: String (name of the vendor, candidate, or buyer. Default: null)",
        "- invoiceNumber: String (invoice, purchase order, or document identification number. Default: null)",
        "- gst: String (tax or GST identifier. Default: null)",
        "- amount: Double (total numeric value or amount. Default: null)",
        "- dueDate: String (due date of the invoice/PO/contract in ISO date format YYYY-MM-DD. Default: null)",
        "- currency: String (3-letter currency code, e.g., USD, INR. Default: 'USD')",
        "- category: String (MUST be one of: INVOICE, RESUME, PURCHASE_ORDER, CONTRACT, OTHER)",
        "- summary: String (2-3 sentence brief summary profile of the document)",
        "",
        "Required confidence scores (value between 0.0 and 1.0 based on how clear and explicitly stated the value is in the text):",
        "- vendorConfidence",
        "- invoiceNumberConfidence",
        "- amountConfidence",
        "- dueDateConfidence",
        "- categoryConfidence",
        "",
        "You must return ONLY a structured JSON matching the ExtractedMetadata class schema."
    })
    @UserMessage("Raw OCR Text:\n{{text}}")
    ExtractedMetadata extract(@V("text") String text);
}
