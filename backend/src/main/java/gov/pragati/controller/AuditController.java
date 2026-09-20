package gov.pragati.controller;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.entity.AuditAction;
import gov.pragati.entity.AuditLog;
import gov.pragati.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit Trail", description = "Immutable action tracking and system compliance logs")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'AUDITOR')")
    @Operation(summary = "Get searchable audit logs")
    public ResponseEntity<List<CommonDTOs.AuditLogDTO>> getAuditLogs(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AuditLog> list;
        if (userEmail == null && action == null && entityType == null && startDate == null && endDate == null) {
            list = auditLogRepository.findTop100ByOrderByTimestampDesc();
        } else {
            list = auditLogRepository.findWithFilters(userEmail, action, entityType, startDate, endDate);
        }

        List<CommonDTOs.AuditLogDTO> dtos = list.stream().map(a -> {
            CommonDTOs.AuditLogDTO dto = new CommonDTOs.AuditLogDTO();
            dto.setId(a.getId());
            dto.setUserEmail(a.getUserEmail());
            dto.setUserRole(a.getUserRole());
            dto.setAction(a.getAction());
            dto.setEntityType(a.getEntityType());
            dto.setEntityId(a.getEntityId());
            dto.setEntityName(a.getEntityName());
            dto.setOldValue(a.getOldValue());
            dto.setNewValue(a.getNewValue());
            dto.setDescription(a.getDescription());
            dto.setIpAddress(a.getIpAddress());
            dto.setTimestamp(a.getTimestamp());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
