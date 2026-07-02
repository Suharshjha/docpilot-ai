package com.docpilot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String answer;
    private List<Citation> citations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Citation {
        private Long documentId;
        private String filename;
        private String snippet;
    }
}
