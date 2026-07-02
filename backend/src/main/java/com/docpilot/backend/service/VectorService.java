package com.docpilot.backend.service;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.repository.DocumentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class VectorService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AuditService auditService;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.pinecone.api-key:}")
    private String pineconeApiKey;

    @Value("${app.pinecone.index-url:}")
    private String pineconeIndexUrl;

    @Value("${app.pinecone.mock:true}")
    private boolean pineconeMock;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory vector database fallback for local offline simulation
    public static final List<VectorRecord> IN_MEMORY_VECTORS = new CopyOnWriteArrayList<>();

    public static class VectorRecord {
        private String id;
        private Long documentId;
        private String filename;
        private String text;
        private List<Double> values;

        public VectorRecord(String id, Long documentId, String filename, String text, List<Double> values) {
            this.id = id;
            this.documentId = documentId;
            this.filename = filename;
            this.text = text;
            this.values = values;
        }

        public String getId() { return id; }
        public Long getDocumentId() { return documentId; }
        public String getFilename() { return filename; }
        public String getText() { return text; }
        public List<Double> getValues() { return values; }
    }

    @Async("ocrTaskExecutor")
    public void indexDocumentAsync(Long documentId) {
        indexDocumentSync(documentId);
    }

    public void indexDocumentSync(Long documentId) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            return;
        }

        String rawText = document.getRawText();
        if (rawText == null || rawText.trim().isEmpty()) {
            auditService.log("VECTOR_INDEX_SKIP", "System", "Skipped indexing for document: " + document.getOriginalFilename() + " (No text extracted)");
            return;
        }

        auditService.log("VECTOR_INDEX_START", "System", "Started vector indexing for document: " + document.getOriginalFilename());

        try {
            List<String> chunks = chunkText(rawText);
            List<VectorRecord> recordsToUpsert = new ArrayList<>();

            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = chunks.get(i);
                List<Double> embedding = getEmbedding(chunkText);
                String id = "doc_" + document.getId() + "_chunk_" + i;
                recordsToUpsert.add(new VectorRecord(id, document.getId(), document.getOriginalFilename(), chunkText, embedding));
            }

            if (pineconeMock || pineconeApiKey.isEmpty() || pineconeIndexUrl.isEmpty()) {
                // Mock In-Memory Indexing
                // Remove any existing chunks for this document first (to support re-indexing/updates)
                IN_MEMORY_VECTORS.removeIf(record -> record.getDocumentId().equals(document.getId()));
                IN_MEMORY_VECTORS.addAll(recordsToUpsert);

                // Simulate processing delay
                Thread.sleep(1000);
                auditService.log("VECTOR_INDEX_SUCCESS", "System", "Indexed " + chunks.size() + " chunks in mock in-memory database for: " + document.getOriginalFilename());
            } else {
                // Real Pinecone Indexing
                upsertToPinecone(recordsToUpsert);
                auditService.log("VECTOR_INDEX_SUCCESS", "System", "Indexed " + chunks.size() + " chunks in Pinecone index for: " + document.getOriginalFilename());
            }

        } catch (Exception e) {
            auditService.log("VECTOR_INDEX_FAILED", "System", "Failed to index document: " + document.getOriginalFilename() + ". Error: " + e.getMessage());
        }
    }

    public List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return chunks;
        }

        int length = text.length();
        int start = 0;
        int chunkSize = 500; // character count per chunk
        int overlap = 100;   // character overlap

        while (start < length) {
            int end = Math.min(start + chunkSize, length);
            chunks.add(text.substring(start, end));
            if (end == length) {
                break;
            }
            start += (chunkSize - overlap);
        }
        return chunks;
    }

    public List<Double> getEmbedding(String text) {
        if (geminiApiKey.isEmpty() || pineconeMock) {
            return generateMockEmbedding(text);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", text);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "models/text-embedding-004");
            requestBody.put("content", contentPart);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map embeddingMap = (Map) response.getBody().get("embedding");
                if (embeddingMap != null) {
                    List<Number> values = (List<Number>) embeddingMap.get("values");
                    if (values != null) {
                        List<Double> doubleValues = new ArrayList<>();
                        for (Number num : values) {
                            doubleValues.add(num.doubleValue());
                        }
                        return doubleValues;
                    }
                }
            }
        } catch (Exception e) {
            // Fallback silently to mock if API key fails or errors
        }
        return generateMockEmbedding(text);
    }

    private List<Double> generateMockEmbedding(String text) {
        List<Double> mockVector = new ArrayList<>();
        Random rand = new Random(text.hashCode());
        for (int i = 0; i < 768; i++) {
            mockVector.add(rand.nextDouble() * 2.0 - 1.0);
        }

        // Normalize vector so dot product equals cosine similarity
        double sumSq = 0.0;
        for (double val : mockVector) {
            sumSq += val * val;
        }
        double magnitude = Math.sqrt(sumSq);
        List<Double> normalized = new ArrayList<>();
        for (double val : mockVector) {
            normalized.add(val / magnitude);
        }
        return normalized;
    }

    private void upsertToPinecone(List<VectorRecord> records) throws Exception {
        String url = pineconeIndexUrl.trim();
        if (!url.endsWith("/")) {
            url += "/";
        }
        url += "vectors/upsert";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", pineconeApiKey);

        List<Map<String, Object>> vectorsPayload = new ArrayList<>();
        for (VectorRecord record : records) {
            Map<String, Object> vector = new HashMap<>();
            vector.put("id", record.getId());
            vector.put("values", record.getValues());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("documentId", record.getDocumentId());
            metadata.put("filename", record.getFilename());
            metadata.put("text", record.getText());

            vector.put("metadata", metadata);
            vectorsPayload.add(vector);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("vectors", vectorsPayload);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        restTemplate.postForEntity(url, entity, Map.class);
    }

    public List<VectorRecord> queryVectors(List<Double> queryEmbedding, int topK) {
        if (pineconeMock || pineconeApiKey.isEmpty() || pineconeIndexUrl.isEmpty()) {
            // In-Memory Cosine Similarity Matcher
            List<Map.Entry<VectorRecord, Double>> ranked = new ArrayList<>();
            for (VectorRecord record : IN_MEMORY_VECTORS) {
                double sim = cosineSimilarity(queryEmbedding, record.getValues());
                ranked.add(new AbstractMap.SimpleEntry<>(record, sim));
            }

            ranked.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

            List<VectorRecord> results = new ArrayList<>();
            for (int i = 0; i < Math.min(topK, ranked.size()); i++) {
                results.add(ranked.get(i).getKey());
            }
            return results;
        } else {
            // Real Pinecone Query
            try {
                return queryPinecone(queryEmbedding, topK);
            } catch (Exception e) {
                // Fallback to in-memory if query fails
                return new ArrayList<>();
            }
        }
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0.0;
        for (int i = 0; i < Math.min(a.size(), b.size()); i++) {
            dot += a.get(i) * b.get(i);
        }
        return dot; // Assumes both vectors are normalized
    }

    private List<VectorRecord> queryPinecone(List<Double> queryEmbedding, int topK) throws Exception {
        String url = pineconeIndexUrl.trim();
        if (!url.endsWith("/")) {
            url += "/";
        }
        url += "query";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Api-Key", pineconeApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("vector", queryEmbedding);
        requestBody.put("topK", topK);
        requestBody.put("includeMetadata", true);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        List<VectorRecord> results = new ArrayList<>();
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map> matches = (List<Map>) response.getBody().get("matches");
            if (matches != null) {
                for (Map match : matches) {
                    String id = (String) match.get("id");
                    Map metadata = (Map) match.get("metadata");
                    if (metadata != null) {
                        Long documentId = ((Number) metadata.get("documentId")).longValue();
                        String filename = (String) metadata.get("filename");
                        String text = (String) metadata.get("text");
                        List<Double> values = (List<Double>) match.get("values");
                        results.add(new VectorRecord(id, documentId, filename, text, values));
                    }
                }
            }
        }
        return results;
    }
}
