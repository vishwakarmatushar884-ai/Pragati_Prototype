package gov.pragati.service;

import gov.pragati.dto.IssueDTOs;
import gov.pragati.entity.*;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.IssueCommentRepository;
import gov.pragati.repository.IssueRepository;
import gov.pragati.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueCommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final HealthScoreService healthScoreService;

    public IssueService(IssueRepository issueRepository,
                        IssueCommentRepository commentRepository,
                        ProjectRepository projectRepository,
                        AuditService auditService,
                        NotificationService notificationService,
                        HealthScoreService healthScoreService) {
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.healthScoreService = healthScoreService;
    }

    public List<IssueDTOs.IssueDTO> getIssues(Long projectId, IssueStatus status, IssuePriority priority, IssueCategory category) {
        List<Issue> list;
        if (projectId != null) {
            list = issueRepository.findByProjectId(projectId);
        } else {
            list = issueRepository.findAll();
        }

        if (status != null) {
            list = list.stream().filter(i -> i.getStatus() == status).collect(Collectors.toList());
        }
        if (priority != null) {
            list = list.stream().filter(i -> i.getPriority() == priority).collect(Collectors.toList());
        }
        if (category != null) {
            list = list.stream().filter(i -> i.getCategory() == category).collect(Collectors.toList());
        }

        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public IssueDTOs.IssueDTO getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        return toDTO(issue);
    }

    @Transactional
    public IssueDTOs.IssueDTO createIssue(IssueDTOs.CreateIssueRequest req, String reportedBy) {
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", req.getProjectId()));

        Issue issue = new Issue();
        issue.setProject(project);
        issue.setTitle(req.getTitle());
        issue.setDescription(req.getDescription());
        issue.setCategory(req.getCategory() != null ? req.getCategory() : IssueCategory.OTHER);
        issue.setPriority(req.getPriority() != null ? req.getPriority() : IssuePriority.MEDIUM);
        issue.setStatus(IssueStatus.OPEN);
        issue.setAssignedTo(req.getAssignedTo());
        issue.setReportedBy(reportedBy != null ? reportedBy : "Field Officer");
        issue.setDueDate(req.getDueDate());
        issue.setActionRequired(req.getActionRequired());
        issue.setCreatedAt(LocalDateTime.now());
        issue.setUpdatedAt(LocalDateTime.now());

        Issue saved = issueRepository.save(issue);

        // Send notification if assigned
        if (req.getAssignedTo() != null && !req.getAssignedTo().isBlank()) {
            notificationService.sendNotification(
                    req.getAssignedTo(),
                    "New Issue Assigned: " + req.getTitle(),
                    "You have been assigned issue: " + req.getTitle() + " on project " + project.getProjectName(),
                    "ISSUE",
                    project.getId(),
                    req.getPriority() != null ? req.getPriority().name() : "MEDIUM"
            );
        }

        auditService.logAction(AuditAction.CREATE_ISSUE, "Issue", saved.getId(), saved.getTitle(),
                null, saved.getPriority().name(), "Created issue: " + saved.getTitle());

        return toDTO(saved);
    }

    @Transactional
    public IssueDTOs.IssueDTO updateIssue(Long id, IssueDTOs.UpdateIssueRequest req) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        if (req.getTitle() != null) issue.setTitle(req.getTitle());
        if (req.getDescription() != null) issue.setDescription(req.getDescription());
        if (req.getCategory() != null) issue.setCategory(req.getCategory());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        if (req.getStatus() != null) issue.setStatus(req.getStatus());
        if (req.getAssignedTo() != null) issue.setAssignedTo(req.getAssignedTo());
        if (req.getDueDate() != null) issue.setDueDate(req.getDueDate());
        if (req.getActionRequired() != null) issue.setActionRequired(req.getActionRequired());
        if (req.getResolution() != null) issue.setResolution(req.getResolution());

        issue.setUpdatedAt(LocalDateTime.now());
        Issue saved = issueRepository.save(issue);

        auditService.logAction(AuditAction.UPDATE_ISSUE, "Issue", saved.getId(), saved.getTitle(),
                null, saved.getStatus().name(), "Updated issue status/details");

        return toDTO(saved);
    }

    @Transactional
    public IssueDTOs.IssueDTO resolveIssue(Long id, IssueDTOs.ResolveIssueRequest req, String resolvedBy) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        issue.setStatus(IssueStatus.RESOLVED);
        issue.setResolution(req.getResolution());
        issue.setResolvedDate(LocalDate.now());
        issue.setUpdatedAt(LocalDateTime.now());

        Issue saved = issueRepository.save(issue);

        auditService.logAction(AuditAction.RESOLVE_ISSUE, "Issue", saved.getId(), saved.getTitle(),
                "OPEN", "RESOLVED", "Issue resolved: " + req.getResolution());

        return toDTO(saved);
    }

    @Transactional
    public IssueDTOs.IssueCommentDTO addComment(Long issueId, IssueDTOs.AddCommentRequest req, String authorName, String authorRole) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        IssueComment comment = new IssueComment(
                issue,
                authorName != null ? authorName : "Government Officer",
                authorRole != null ? authorRole : "OFFICER",
                req.getContent()
        );

        IssueComment saved = commentRepository.save(comment);
        issue.setUpdatedAt(LocalDateTime.now());
        issueRepository.save(issue);

        return toCommentDTO(saved);
    }

    public IssueDTOs.IssueDTO toDTO(Issue i) {
        IssueDTOs.IssueDTO dto = new IssueDTOs.IssueDTO();
        dto.setId(i.getId());
        if (i.getProject() != null) {
            dto.setProjectId(i.getProject().getId());
            dto.setProjectName(i.getProject().getProjectName());
            dto.setProjectCode(i.getProject().getProjectCode());
            dto.setMinistry(i.getProject().getMinistry());
        }
        dto.setTitle(i.getTitle());
        dto.setDescription(i.getDescription());
        dto.setCategory(i.getCategory());
        dto.setPriority(i.getPriority());
        dto.setStatus(i.getStatus());
        dto.setAssignedTo(i.getAssignedTo());
        dto.setReportedBy(i.getReportedBy());
        dto.setDueDate(i.getDueDate());
        dto.setResolvedDate(i.getResolvedDate());
        dto.setActionRequired(i.getActionRequired());
        dto.setResolution(i.getResolution());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setUpdatedAt(i.getUpdatedAt());

        List<IssueComment> comments = commentRepository.findByIssueIdOrderByCreatedAtAsc(i.getId());
        dto.setComments(comments.stream().map(this::toCommentDTO).collect(Collectors.toList()));

        return dto;
    }

    public IssueDTOs.IssueCommentDTO toCommentDTO(IssueComment c) {
        IssueDTOs.IssueCommentDTO dto = new IssueDTOs.IssueCommentDTO();
        dto.setId(c.getId());
        dto.setAuthorName(c.getAuthorName());
        dto.setAuthorRole(c.getAuthorRole());
        dto.setContent(c.getContent());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
