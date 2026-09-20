package gov.pragati.controller;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.SettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Admin Settings", description = "Dynamic EVM thresholds, health weights, and escalation configurations")
public class SettingController {

    private final SettingService settingService;

    public SettingController(SettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    @Operation(summary = "Get all configurable thresholds and system settings")
    public ResponseEntity<CommonDTOs.SystemSettingsDTO> getSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN')")
    @Operation(summary = "Update system settings, EVM thresholds, and health weights")
    public ResponseEntity<Void> updateSettings(
            @RequestBody CommonDTOs.SystemSettingsDTO dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String updatedBy = userPrincipal != null ? userPrincipal.getFullName() : "Administrator";
        settingService.updateSettings(dto, updatedBy);
        return ResponseEntity.ok().build();
    }
}
