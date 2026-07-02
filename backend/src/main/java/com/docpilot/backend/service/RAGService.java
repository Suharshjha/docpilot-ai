package com.docpilot.backend.service;

import com.docpilot.backend.dto.ChatRequest;
import com.docpilot.backend.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RAGService {

    @Autowired
    private VectorService vectorService;

    @Autowired
    private GeminiService geminiService;

    public ChatResponse askCopilot(ChatRequest request) {
        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ChatResponse.builder()
                    .answer("Please enter a valid question.")
                    .citations(new ArrayList<>())
                    .build();
        }

        // 1. Generate query embedding vector
        List<Double> queryEmbedding = vectorService.getEmbedding(userMessage);

        // 2. Fetch top 5 matching text chunks
        List<VectorService.VectorRecord> similarChunks = vectorService.queryVectors(queryEmbedding, 5);

        // 3. Compile context text and build citations DTO list
        StringBuilder contextBuilder = new StringBuilder();
        List<ChatResponse.Citation> citations = new ArrayList<>();

        for (VectorService.VectorRecord record : similarChunks) {
            contextBuilder.append("Source File: ").append(record.getFilename()).append("\n")
                          .append("Snippet: ").append(record.getText()).append("\n\n");

            // Avoid adding identical snippets if duplicated
            boolean exists = citations.stream()
                    .anyMatch(c -> c.getDocumentId().equals(record.getDocumentId()) && c.getSnippet().equals(record.getText()));
            if (!exists) {
                citations.add(ChatResponse.Citation.builder()
                        .documentId(record.getDocumentId())
                        .filename(record.getFilename())
                        .snippet(record.getText())
                        .build());
            }
        }

        // 4. Construct the prompt for Gemini RAG
        String prompt = "You are DocPilot AI Copilot, a helpful business document QA assistant. "
                + "Answer the user's question accurately using ONLY the provided context snippets below. "
                + "Be concise and quote relevant details (like dates, invoice numbers, or amounts) if they are present. "
                + "If the answer is not contained in the context snippets, respond with: "
                + "'I couldn't find the answer to that in the approved documents.'\n\n"
                + "Context Snippets:\n" + contextBuilder.toString()
                + "User Question:\n" + userMessage;

        // 5. Query the LLM and construct final response
        String answer = geminiService.generateText(prompt);

        return ChatResponse.builder()
                .answer(answer.trim())
                .citations(citations)
                .build();
    }
}
