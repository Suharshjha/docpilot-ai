package com.docpilot.backend.service;

import com.docpilot.backend.dto.AuditLogDto;
import com.docpilot.backend.entity.AuditLog;
import com.docpilot.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String username, String details) {
        String ipAddress = getClientIp();
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .username(username)
                .ipAddress(ipAddress)
                .details(details)
                .build();
        auditLogRepository.save(auditLog);
    }

    public Page<AuditLogDto> getAuditLogs(String query, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.searchLogs(query, pageable);
        return logs.map(this::convertToDto);
    }

    private AuditLogDto convertToDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .action(log.getAction())
                .username(log.getUsername())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .details(log.getDetails())
                .build();
    }

    private String getClientIp() {
        try {
            RequestAttributes attribs = RequestContextHolder.getRequestAttributes();
            if (attribs instanceof ServletRequestAttributes) {
                HttpServletRequest request = ((ServletRequestAttributes) attribs).getRequest();
                if (request != null) {
                    String remoteAddr = request.getHeader("X-FORWARDED-FOR");
                    if (remoteAddr == null || remoteAddr.isEmpty()) {
                        remoteAddr = request.getRemoteAddr();
                    }
                    return remoteAddr;
                }
            }
        } catch (Exception e) {
            // Fallback for async thread execution
        }
        return "127.0.0.1";
    }
}
