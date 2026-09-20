package gov.pragati.controller;

import gov.pragati.dto.MilestoneDTOs;
import gov.pragati.service.MilestoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Milestones", description = "Project milestone tracking and status updates")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @GetMapping("/projects/{projectId}/milestones")
    @Operation(summary = "Get all milestones for a project")
    public ResponseEntity<List<MilestoneDTOs.MilestoneDTO>> getMilestones(@PathVariable Long projectId) {
        List<MilestoneDTOs.MilestoneDTO> list = milestoneService.getMilestonesByProject(projectId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Add milestone to project")
    public ResponseEntity<MilestoneDTOs.MilestoneDTO> createMilestone(
            @PathVariable Long projectId,
            @Valid @RequestBody MilestoneDTOs.CreateMilestoneRequest req) {
        MilestoneDTOs.MilestoneDTO created = milestoneService.createMilestone(projectId, req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/milestones/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Update milestone progress or status")
    public ResponseEntity<MilestoneDTOs.MilestoneDTO> updateMilestone(
            @PathVariable Long id,
            @RequestBody MilestoneDTOs.UpdateMilestoneRequest req) {
        MilestoneDTOs.MilestoneDTO updated = milestoneService.updateMilestone(id, req);
        return ResponseEntity.ok(updated);
    }
}
