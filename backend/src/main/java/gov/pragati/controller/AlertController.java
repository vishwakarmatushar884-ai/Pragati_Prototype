package gov.pragati.controller;

import gov.pragati.dto.AlertDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts & Escalation", description = "Automated alert management and two-level escalation workflows")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Get all alerts with optional status/severity filters")
    public ResponseEntity<List<AlertDTOs.AlertDTO>> getAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Long projectId) {
        List<AlertDTOs.AlertDTO> list = alertService.getAllAlerts(status, severity, projectId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert details and escalation timeline")
    public ResponseEntity<AlertDTOs.AlertDTO> getAlertById(@PathVariable Long id) {
        AlertDTOs.AlertDTO dto = alertService.getAlertById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Acknowledge receipt of an active alert")
    public ResponseEntity<AlertDTOs.AlertDTO> acknowledgeAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String name = userPrincipal != null ? userPrincipal.getFullName() : "Officer";
        AlertDTOs.AlertDTO acknowledged = alertService.acknowledgeAlert(id, name);
        return ResponseEntity.ok(acknowledged);
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Resolve an active alert")
    public ResponseEntity<AlertDTOs.AlertDTO> resolveAlert(
            @PathVariable Long id,
            @Valid @RequestBody AlertDTOs.ResolveAlertRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String name = userPrincipal != null ? userPrincipal.getFullName() : "Project In-charge";
        AlertDTOs.AlertDTO resolved = alertService.resolveAlert(id, name, req.getResolutionNotes());
        return ResponseEntity.ok(resolved);
    }

    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Escalate alert to next administrative level (Level 1 or Level 2)")
    public ResponseEntity<AlertDTOs.AlertDTO> escalateAlert(
            @PathVariable Long id,
            @RequestBody(required = false) AlertDTOs.EscalateAlertRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String name = userPrincipal != null ? userPrincipal.getFullName() : "Officer";
        String reason = req != null && req.getReason() != null ? req.getReason() : "Manual Escalation via Management Portal";
        AlertDTOs.AlertDTO escalated = alertService.escalateAlert(id, reason, name);
        return ResponseEntity.ok(escalated);
    }
}
