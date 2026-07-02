package com.docpilot.backend.controller;

import com.docpilot.backend.dto.ChatRequest;
import com.docpilot.backend.dto.ChatResponse;
import com.docpilot.backend.service.RAGService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RAGController {

    @Autowired
    private RAGService ragService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = ragService.askCopilot(request);
        return ResponseEntity.ok(response);
    }
}
