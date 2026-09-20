package gov.pragati.controller;

import gov.pragati.dto.MLDTOs;
import gov.pragati.dto.ProjectDTOs;
import gov.pragati.entity.Project;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.ProjectRepository;
import gov.pragati.service.MLIntegrationService;
import gov.pragati.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risks")
@Tag(name = "Risk & AI", description = "AI Risk classification, SHAP explanations, and delay predictions")
public class RiskController {

    private final ProjectRepository projectRepository;
    private final MLIntegrationService mlIntegrationService;
    private final ProjectService projectService;

    public RiskController(ProjectRepository projectRepository,
                          MLIntegrationService mlIntegrationService,
                          ProjectService projectService) {
        this.projectRepository = projectRepository;
        this.mlIntegrationService = mlIntegrationService;
        this.projectService = projectService;
    }

    @GetMapping("/projects/{id}")
    @Operation(summary = "Get detailed AI risk explanation and SHAP factor attributions for a project")
    public ResponseEntity<MLDTOs.MLExplainResponse> getProjectRiskExplanation(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        MLDTOs.MLExplainResponse explanation = mlIntegrationService.analyzeAndPredict(project);
        projectRepository.save(project);

        return ResponseEntity.ok(explanation);
    }

    @PostMapping("/projects/{id}/recalculate")
    @Operation(summary = "Manually trigger AI risk re-evaluation")
    public ResponseEntity<ProjectDTOs.ProjectDTO> recalculateRisk(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        mlIntegrationService.analyzeAndPredict(project);
        Project saved = projectRepository.save(project);

        return ResponseEntity.ok(projectService.toDTO(saved));
    }
}
