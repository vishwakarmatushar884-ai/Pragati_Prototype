package gov.pragati.controller;

import gov.pragati.dto.IssueDTOs;
import gov.pragati.entity.IssueCategory;
import gov.pragati.entity.IssuePriority;
import gov.pragati.entity.IssueStatus;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@Tag(name = "Issues & Action Tracker", description = "Issue management, resolution pipeline, and officer assignment")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    @Operation(summary = "Get issues with optional filters")
    public ResponseEntity<List<IssueDTOs.IssueDTO>> getIssues(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) IssueCategory category) {
        List<IssueDTOs.IssueDTO> list = issueService.getIssues(projectId, status, priority, category);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get issue details by ID")
    public ResponseEntity<IssueDTOs.IssueDTO> getIssueById(@PathVariable Long id) {
        IssueDTOs.IssueDTO dto = issueService.getIssueById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Report a new issue")
    public ResponseEntity<IssueDTOs.IssueDTO> createIssue(
            @Valid @RequestBody IssueDTOs.CreateIssueRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String reporter = userPrincipal != null ? userPrincipal.getFullName() : "Field Officer";
        IssueDTOs.IssueDTO created = issueService.createIssue(req, reporter);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Update issue details or assignment")
    public ResponseEntity<IssueDTOs.IssueDTO> updateIssue(
            @PathVariable Long id,
            @RequestBody IssueDTOs.UpdateIssueRequest req) {
        IssueDTOs.IssueDTO updated = issueService.updateIssue(id, req);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER', 'FIELD_OFFICER')")
    @Operation(summary = "Resolve issue with resolution notes")
    public ResponseEntity<IssueDTOs.IssueDTO> resolveIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueDTOs.ResolveIssueRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String resolver = userPrincipal != null ? userPrincipal.getFullName() : "Project In-charge";
        IssueDTOs.IssueDTO resolved = issueService.resolveIssue(id, req, resolver);
        return ResponseEntity.ok(resolved);
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add comment to issue activity timeline")
    public ResponseEntity<IssueDTOs.IssueCommentDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody IssueDTOs.AddCommentRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String authorName = userPrincipal != null ? userPrincipal.getFullName() : "Officer";
        String authorRole = userPrincipal != null && !userPrincipal.getAuthorities().isEmpty() ?
                userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "") : "OFFICER";
        IssueDTOs.IssueCommentDTO comment = issueService.addComment(id, req, authorName, authorRole);
        return ResponseEntity.ok(comment);
    }
}
