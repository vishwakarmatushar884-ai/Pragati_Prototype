package gov.pragati.service;

import gov.pragati.dto.MilestoneDTOs;
import gov.pragati.entity.AuditAction;
import gov.pragati.entity.Milestone;
import gov.pragati.entity.MilestoneStatus;
import gov.pragati.entity.Project;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.MilestoneRepository;
import gov.pragati.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final AuditService auditService;

    public MilestoneService(MilestoneRepository milestoneRepository,
                            ProjectRepository projectRepository,
                            AuditService auditService) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.auditService = auditService;
    }

    public List<MilestoneDTOs.MilestoneDTO> getMilestonesByProject(Long projectId) {
        List<Milestone> list = milestoneRepository.findByProjectId(projectId);
        // Evaluate overdue flags
        LocalDate today = LocalDate.now();
        list.forEach(m -> {
            boolean isOverdue = m.getStatus() != MilestoneStatus.COMPLETED &&
                                m.getPlannedEndDate() != null &&
                                m.getPlannedEndDate().isBefore(today);
            if (m.isOverdue() != isOverdue) {
                m.setOverdue(isOverdue);
                milestoneRepository.save(m);
            }
        });
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public MilestoneDTOs.MilestoneDTO createMilestone(Long projectId, MilestoneDTOs.CreateMilestoneRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        Milestone milestone = new Milestone();
        milestone.setProject(project);
        milestone.setName(req.getName());
        milestone.setDescription(req.getDescription());
        milestone.setPlannedStartDate(req.getPlannedStartDate());
        milestone.setPlannedEndDate(req.getPlannedEndDate());
        milestone.setWeightagePercentage(req.getWeightagePercentage() != null ? req.getWeightagePercentage() : 10.0);
        milestone.setResponsibleOfficer(req.getResponsibleOfficer());
        milestone.setStatus(MilestoneStatus.NOT_STARTED);
        milestone.setPlannedProgress(0.0);
        milestone.setActualProgress(0.0);
        milestone.setOverdue(req.getPlannedEndDate().isBefore(LocalDate.now()));

        Milestone saved = milestoneRepository.save(milestone);

        auditService.logAction(AuditAction.UPDATE_PROJECT, "Milestone", saved.getId(), saved.getName(),
                null, saved.getName(), "Added milestone: " + saved.getName() + " to project " + project.getProjectCode());

        return toDTO(saved);
    }

    @Transactional
    public MilestoneDTOs.MilestoneDTO updateMilestone(Long id, MilestoneDTOs.UpdateMilestoneRequest req) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", "id", id));

        if (req.getName() != null) milestone.setName(req.getName());
        if (req.getDescription() != null) milestone.setDescription(req.getDescription());
        if (req.getActualStartDate() != null) milestone.setActualStartDate(req.getActualStartDate());
        if (req.getActualEndDate() != null) milestone.setActualEndDate(req.getActualEndDate());
        if (req.getActualProgress() != null) milestone.setActualProgress(req.getActualProgress());
        if (req.getStatus() != null) milestone.setStatus(req.getStatus());
        if (req.getResponsibleOfficer() != null) milestone.setResponsibleOfficer(req.getResponsibleOfficer());

        milestone.setUpdatedAt(LocalDateTime.now());
        milestone.setOverdue(milestone.getStatus() != MilestoneStatus.COMPLETED &&
                milestone.getPlannedEndDate() != null &&
                milestone.getPlannedEndDate().isBefore(LocalDate.now()));

        Milestone saved = milestoneRepository.save(milestone);
        return toDTO(saved);
    }

    public MilestoneDTOs.MilestoneDTO toDTO(Milestone m) {
        MilestoneDTOs.MilestoneDTO dto = new MilestoneDTOs.MilestoneDTO();
        dto.setId(m.getId());
        if (m.getProject() != null) {
            dto.setProjectId(m.getProject().getId());
            dto.setProjectName(m.getProject().getProjectName());
        }
        dto.setName(m.getName());
        dto.setDescription(m.getDescription());
        dto.setPlannedStartDate(m.getPlannedStartDate());
        dto.setPlannedEndDate(m.getPlannedEndDate());
        dto.setActualStartDate(m.getActualStartDate());
        dto.setActualEndDate(m.getActualEndDate());
        dto.setWeightagePercentage(m.getWeightagePercentage());
        dto.setPlannedProgress(m.getPlannedProgress());
        dto.setActualProgress(m.getActualProgress());
        dto.setStatus(m.getStatus());
        dto.setResponsibleOfficer(m.getResponsibleOfficer());
        dto.setOverdue(m.isOverdue());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }
}
