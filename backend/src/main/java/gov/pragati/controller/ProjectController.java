package gov.pragati.controller;

import gov.pragati.dto.ProjectDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Centralized Project Data Hub and EVM operations")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Get all projects with optional filtering")
    public ResponseEntity<List<ProjectDTOs.ProjectDTO>> getProjects(
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query) {
        List<ProjectDTOs.ProjectDTO> list = projectService.getProjects(ministry, state, sector, riskLevel, status, query);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed project by ID")
    public ResponseEntity<ProjectDTOs.ProjectDTO> getProjectById(@PathVariable Long id) {
        ProjectDTOs.ProjectDTO dto = projectService.getProjectById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create a new infrastructure project")
    public ResponseEntity<ProjectDTOs.ProjectDTO> createProject(@Valid @RequestBody ProjectDTOs.CreateProjectRequest req) {
        ProjectDTOs.ProjectDTO created = projectService.createProject(req);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update project metadata")
    public ResponseEntity<ProjectDTOs.ProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDTOs.UpdateProjectRequest req) {
        ProjectDTOs.ProjectDTO updated = projectService.updateProject(id, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN')")
    @Operation(summary = "Delete project")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Submit field progress update (Triggers EVM, Health, Anomaly, ML Risk, Alerts, and Audit pipeline)")
    public ResponseEntity<ProjectDTOs.ProjectDTO> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDTOs.ProgressUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String updatedBy = userPrincipal != null ? userPrincipal.getFullName() : "Field Officer";
        ProjectDTOs.ProjectDTO result = projectService.updateProgress(id, req, updatedBy);
        return ResponseEntity.ok(result);
    }
}
