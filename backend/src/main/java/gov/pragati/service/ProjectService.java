package gov.pragati.service;

import gov.pragati.dto.ProjectDTOs;
import gov.pragati.entity.*;
import gov.pragati.exception.BadRequestException;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectUpdateRepository updateRepository;
    private final MilestoneRepository milestoneRepository;
    private final IssueRepository issueRepository;
    private final AlertRepository alertRepository;
    private final EvmCalculationService evmCalculationService;
    private final HealthScoreService healthScoreService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final MLIntegrationService mlIntegrationService;
    private final AlertService alertService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectUpdateRepository updateRepository,
                          MilestoneRepository milestoneRepository,
                          IssueRepository issueRepository,
                          AlertRepository alertRepository,
                          EvmCalculationService evmCalculationService,
                          HealthScoreService healthScoreService,
                          AnomalyDetectionService anomalyDetectionService,
                          MLIntegrationService mlIntegrationService,
                          AlertService alertService,
                          AuditService auditService,
                          NotificationService notificationService) {
        this.projectRepository = projectRepository;
        this.updateRepository = updateRepository;
        this.milestoneRepository = milestoneRepository;
        this.issueRepository = issueRepository;
        this.alertRepository = alertRepository;
        this.evmCalculationService = evmCalculationService;
        this.healthScoreService = healthScoreService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.mlIntegrationService = mlIntegrationService;
        this.alertService = alertService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public List<ProjectDTOs.ProjectDTO> getProjects(String ministry, String state, String sector, String riskLevel, String status, String query) {
        List<Project> list = projectRepository.findWithFilters(
                (ministry != null && !ministry.isBlank()) ? ministry : null,
                (state != null && !state.isBlank()) ? state : null,
                (sector != null && !sector.isBlank()) ? sector : null,
                (riskLevel != null && !riskLevel.isBlank()) ? riskLevel : null,
                (status != null && !status.isBlank()) ? status : null,
                (query != null && !query.isBlank()) ? query.trim() : null
        );

        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProjectDTOs.ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        return toDTO(project);
    }

    @Transactional
    public ProjectDTOs.ProjectDTO createProject(ProjectDTOs.CreateProjectRequest req) {
        if (projectRepository.findByProjectCode(req.getProjectCode()).isPresent()) {
            throw new BadRequestException("Project code already exists: " + req.getProjectCode());
        }
        if (req.getPlannedEndDate().isBefore(req.getStartDate())) {
            throw new BadRequestException("Planned end date cannot be earlier than start date");
        }

        Project project = new Project();
        project.setProjectCode(req.getProjectCode());
        project.setProjectName(req.getProjectName());
        project.setMinistry(req.getMinistry());
        project.setDepartment(req.getDepartment());
        project.setScheme(req.getScheme());
        project.setSector(req.getSector());
        project.setProjectDescription(req.getProjectDescription());
        project.setProjectManager(req.getProjectManager());
        project.setImplementingAgency(req.getImplementingAgency());
        project.setContractor(req.getContractor());
        project.setState(req.getState());
        project.setDistrict(req.getDistrict());
        project.setLocation(req.getLocation());
        project.setLatitude(req.getLatitude() != null ? req.getLatitude() : 20.5937);
        project.setLongitude(req.getLongitude() != null ? req.getLongitude() : 78.9629);
        project.setStartDate(req.getStartDate());
        project.setPlannedEndDate(req.getPlannedEndDate());
        project.setProjectBudget(req.getProjectBudget());
        project.setApprovedCost(req.getApprovedCost() != null ? req.getApprovedCost() : req.getProjectBudget());
        project.setPriority(req.getPriority() != null ? req.getPriority() : "MEDIUM");
        project.setCurrentStatus("IN_PROGRESS");
        project.setPhysicalProgress(0.0);
        project.setPlannedProgress(5.0);
        project.setActualCost(0.0);

        // Calculate initial EVM & Risk
        evmCalculationService.recalculateEvmMetrics(project);
        healthScoreService.calculateHealthScore(project, 0, 0, 0);

        Project saved = projectRepository.save(project);

        auditService.logAction(AuditAction.CREATE_PROJECT, "Project", saved.getId(), saved.getProjectName(),
                null, saved.getProjectCode(), "Created new project: " + saved.getProjectName());

        return toDTO(saved);
    }

    @Transactional
    public ProjectDTOs.ProjectDTO updateProject(Long id, ProjectDTOs.UpdateProjectRequest req) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (req.getProjectName() != null) project.setProjectName(req.getProjectName());
        if (req.getMinistry() != null) project.setMinistry(req.getMinistry());
        if (req.getDepartment() != null) project.setDepartment(req.getDepartment());
        if (req.getScheme() != null) project.setScheme(req.getScheme());
        if (req.getSector() != null) project.setSector(req.getSector());
        if (req.getProjectDescription() != null) project.setProjectDescription(req.getProjectDescription());
        if (req.getProjectManager() != null) project.setProjectManager(req.getProjectManager());
        if (req.getImplementingAgency() != null) project.setImplementingAgency(req.getImplementingAgency());
        if (req.getContractor() != null) project.setContractor(req.getContractor());
        if (req.getState() != null) project.setState(req.getState());
        if (req.getDistrict() != null) project.setDistrict(req.getDistrict());
        if (req.getLocation() != null) project.setLocation(req.getLocation());
        if (req.getLatitude() != null) project.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) project.setLongitude(req.getLongitude());
        if (req.getPlannedEndDate() != null) project.setPlannedEndDate(req.getPlannedEndDate());
        if (req.getRevisedEndDate() != null) project.setRevisedEndDate(req.getRevisedEndDate());
        if (req.getApprovedCost() != null) project.setApprovedCost(req.getApprovedCost());
        if (req.getCurrentStatus() != null) project.setCurrentStatus(req.getCurrentStatus());
        if (req.getPriority() != null) project.setPriority(req.getPriority());

        project.setLastUpdated(LocalDateTime.now());
        evmCalculationService.recalculateEvmMetrics(project);

        Project saved = projectRepository.save(project);

        auditService.logAction(AuditAction.UPDATE_PROJECT, "Project", saved.getId(), saved.getProjectName(),
                null, null, "Updated project metadata");

        return toDTO(saved);
    }

    @Transactional
    public ProjectDTOs.ProjectDTO updateProgress(Long id, ProjectDTOs.ProgressUpdateRequest req, String updatedByUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (req.getPhysicalProgress() < 0.0 || req.getPhysicalProgress() > 100.0) {
            throw new BadRequestException("Physical progress percentage must be between 0 and 100");
        }

        Double prevPhysical = project.getPhysicalProgress();
        Double prevCost = project.getActualCost();

        // 1. Update project fields
        project.setPhysicalProgress(req.getPhysicalProgress());
        if (req.getPlannedProgress() != null) {
            project.setPlannedProgress(req.getPlannedProgress());
        }
        if (req.getActualCost() != null) {
            if (req.getActualCost() < 0) {
                throw new BadRequestException("Actual expenditure cannot be negative");
            }
            project.setActualCost(req.getActualCost());
        }
        project.setLastUpdated(LocalDateTime.now());

        if (req.getPhysicalProgress() >= 100.0) {
            project.setCurrentStatus("COMPLETED");
            project.setActualCompletionDate(project.getLastUpdated().toLocalDate());
        }

        // 2. Recalculate EVM
        evmCalculationService.recalculateEvmMetrics(project);

        // 3. Recalculate Health Score
        long overdueMilestones = milestoneRepository.findByProjectIdAndOverdueTrue(project.getId()).size();
        long critIssues = issueRepository.findByProjectIdAndPriorityAndStatusNot(project.getId(), IssuePriority.CRITICAL, IssueStatus.CLOSED).size();
        long openIssues = issueRepository.findByProjectIdAndStatusNot(project.getId(), IssueStatus.CLOSED).size();
        healthScoreService.calculateHealthScore(project, overdueMilestones, critIssues, openIssues);

        // 4. Save Progress Update Entry
        ProjectUpdate update = new ProjectUpdate();
        update.setProject(project);
        update.setPreviousPhysicalProgress(prevPhysical);
        update.setNewPhysicalProgress(project.getPhysicalProgress());
        update.setPreviousActualCost(prevCost);
        update.setNewActualCost(project.getActualCost());
        update.setCalculatedSpi(project.getSpi());
        update.setCalculatedCpi(project.getCpi());
        update.setCalculatedHealthScore(project.getHealthScore());
        update.setCalculatedRiskLevel(project.getRiskLevel());
        update.setRemarks(req.getRemarks());
        update.setSitePhotoUrl(req.getSitePhotoUrl());
        update.setUpdatedBy(updatedByUser != null ? updatedByUser : "Field Officer");
        update.setTimestamp(LocalDateTime.now());
        updateRepository.save(update);

        // 5. Run Anomaly Engine
        List<Anomaly> detectedAnomalies = anomalyDetectionService.evaluateAnomalies(project, prevPhysical, prevCost);

        // 6. Call Python ML Service for Risk, Delay, & SHAP explanations
        mlIntegrationService.analyzeAndPredict(project);

        // 7. Check and Generate Automated Alerts
        alertService.checkAndGenerateAlerts(project, detectedAnomalies);

        // 8. Save updated project state
        Project saved = projectRepository.save(project);

        // 9. Log in Audit Trail
        auditService.logAction(
                AuditAction.UPDATE_PROGRESS,
                "Project",
                saved.getId(),
                saved.getProjectName(),
                String.format("Physical: %.1f%%, Cost: ₹%.2f Cr", prevPhysical != null ? prevPhysical : 0.0, prevCost != null ? prevCost : 0.0),
                String.format("Physical: %.1f%%, Cost: ₹%.2f Cr", saved.getPhysicalProgress(), saved.getActualCost()),
                String.format("Progress updated by %s. SPI=%.2f, CPI=%.2f, Risk=%s, Health=%d/100",
                        updatedByUser, saved.getSpi(), saved.getCpi(), saved.getRiskLevel(), saved.getHealthScore())
        );

        return toDTO(saved);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
        projectRepository.delete(project);
        auditService.logAction(AuditAction.UPDATE_PROJECT, "Project", id, project.getProjectName(),
                project.getProjectCode(), "DELETED", "Deleted project: " + project.getProjectName());
    }

    public ProjectDTOs.ProjectDTO toDTO(Project p) {
        ProjectDTOs.ProjectDTO dto = new ProjectDTOs.ProjectDTO();
        dto.setId(p.getId());
        dto.setProjectCode(p.getProjectCode());
        dto.setProjectName(p.getProjectName());
        dto.setMinistry(p.getMinistry());
        dto.setDepartment(p.getDepartment());
        dto.setScheme(p.getScheme());
        dto.setSector(p.getSector());
        dto.setProjectDescription(p.getProjectDescription());
        dto.setProjectManager(p.getProjectManager());
        dto.setImplementingAgency(p.getImplementingAgency());
        dto.setContractor(p.getContractor());
        dto.setState(p.getState());
        dto.setDistrict(p.getDistrict());
        dto.setLocation(p.getLocation());
        dto.setLatitude(p.getLatitude());
        dto.setLongitude(p.getLongitude());
        dto.setStartDate(p.getStartDate());
        dto.setPlannedEndDate(p.getPlannedEndDate());
        dto.setRevisedEndDate(p.getRevisedEndDate());
        dto.setActualCompletionDate(p.getActualCompletionDate());
        dto.setProjectBudget(p.getProjectBudget());
        dto.setApprovedCost(p.getApprovedCost());
        dto.setPlannedCost(p.getPlannedCost());
        dto.setActualCost(p.getActualCost());
        dto.setEarnedValue(p.getEarnedValue());
        dto.setPhysicalProgress(p.getPhysicalProgress());
        dto.setPlannedProgress(p.getPlannedProgress());
        dto.setFinancialProgress(p.getFinancialProgress());
        dto.setSpi(p.getSpi());
        dto.setCpi(p.getCpi());
        dto.setScheduleVariance(p.getScheduleVariance());
        dto.setCostVariance(p.getCostVariance());
        dto.setCurrentStatus(p.getCurrentStatus());
        dto.setPriority(p.getPriority());
        dto.setRiskLevel(p.getRiskLevel());
        dto.setHealthScore(p.getHealthScore());
        dto.setAiRiskProbability(p.getAiRiskProbability());
        dto.setAiPredictedDelayDays(p.getAiPredictedDelayDays());
        dto.setAiExplanationSummary(p.getAiExplanationSummary());
        dto.setManagerId(p.getManagerId());
        dto.setFieldOfficerId(p.getFieldOfficerId());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setLastUpdated(p.getLastUpdated());

        // Dynamic counts
        dto.setOpenIssuesCount(issueRepository.findByProjectIdAndStatusNot(p.getId(), IssueStatus.CLOSED).size());
        dto.setCriticalIssuesCount(issueRepository.findByProjectIdAndPriorityAndStatusNot(p.getId(), IssuePriority.CRITICAL, IssueStatus.CLOSED).size());
        dto.setOverdueMilestonesCount(milestoneRepository.findByProjectIdAndOverdueTrue(p.getId()).size());
        dto.setActiveAlertsCount(alertRepository.findByProjectIdAndStatusNot(p.getId(), AlertStatus.RESOLVED).size());

        return dto;
    }
}
