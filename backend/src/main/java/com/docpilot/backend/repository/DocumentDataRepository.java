package com.docpilot.backend.repository;

import com.docpilot.backend.entity.DocumentData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentDataRepository extends JpaRepository<DocumentData, Long> {
    Optional<DocumentData> findByDocumentId(Long documentId);
}
