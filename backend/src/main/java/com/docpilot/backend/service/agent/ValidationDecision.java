package com.docpilot.backend.service.agent;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationDecision {
    private String decision; // "APPROVED" or "NEEDS_REVIEW"
    private String reasoning;
}
