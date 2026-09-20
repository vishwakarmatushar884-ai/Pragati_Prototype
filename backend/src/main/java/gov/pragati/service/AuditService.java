package gov.pragati.service;

import gov.pragati.entity.AuditAction;
import gov.pragati.entity.AuditLog;
import gov.pragati.repository.AuditLogRepository;
import gov.pragati.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(AuditAction action, String entityType, Long entityId, String entityName, String oldValue, String newValue, String description) {
        String email = "SYSTEM";
        String role = "SYSTEM";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            email = principal.getUsername();
            role = principal.getAuthorities().isEmpty() ? "USER" : principal.getAuthorities().iterator().next().getAuthority();
        }

        AuditLog log = new AuditLog(email, role, action, entityType, entityId, entityName, description);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(log);
    }
}
