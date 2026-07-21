package com.docpilot.backend.service.agent;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface ValidationAgent {

    @SystemMessage({
        "You are a Validation & Routing Agent.",
        "Your task is to take the JSON output of the Extraction Agent, evaluate the confidence scores of the fields, and make a routing decision.",
        "Rules for routing:",
        "1. If ALL confidence scores (vendorConfidence, invoiceNumberConfidence, amountConfidence, dueDateConfidence, categoryConfidence) are greater than or equal to 0.8, decide to 'APPROVED'.",
        "2. If ANY confidence score is less than 0.8, decide to 'NEEDS_REVIEW'.",
        "You must return your decision ('APPROVED' or 'NEEDS_REVIEW') and a detailed explanation of your reasoning (e.g. which fields are low-confidence and why) as a structured ValidationDecision object."
    })
    @UserMessage("Extracted Metadata:\n{{metadata}}")
    ValidationDecision validate(@V("metadata") String metadataJson);
}
