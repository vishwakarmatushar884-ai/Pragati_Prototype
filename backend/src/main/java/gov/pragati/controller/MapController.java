package gov.pragati.controller;

import gov.pragati.dto.ProjectDTOs;
import gov.pragati.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@Tag(name = "GIS Map", description = "GIS Spatial coordinates and project marker APIs")
public class MapController {

    private final ProjectService projectService;

    public MapController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/projects")
    @Operation(summary = "Get geocoded project markers with risk-colored states and KPIs")
    public ResponseEntity<List<ProjectDTOs.ProjectDTO>> getMapProjects(
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String status) {
        List<ProjectDTOs.ProjectDTO> list = projectService.getProjects(ministry, state, sector, riskLevel, status, null);
        return ResponseEntity.ok(list);
    }
}
