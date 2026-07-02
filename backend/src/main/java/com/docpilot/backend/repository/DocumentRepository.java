package com.docpilot.backend.repository;

import com.docpilot.backend.entity.Document;
import com.docpilot.backend.entity.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    @Query(value = "SELECT d FROM Document d JOIN FETCH d.uploadedBy u WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR d.status = :status)",
           countQuery = "SELECT COUNT(d) FROM Document d JOIN d.uploadedBy u WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR d.status = :status)")
    Page<Document> searchDocuments(@Param("query") String query, @Param("status") DocumentStatus status, Pageable pageable);
}
