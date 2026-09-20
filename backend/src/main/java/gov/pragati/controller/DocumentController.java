package gov.pragati.controller;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.entity.Document;
import gov.pragati.entity.Project;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.DocumentRepository;
import gov.pragati.repository.ProjectRepository;
import gov.pragati.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/documents")
@Tag(name = "Documents", description = "Project document repository (DPR, Tenders, Inspection Reports)")
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;

    public DocumentController(DocumentRepository documentRepository, ProjectRepository projectRepository) {
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
    }

    @GetMapping
    @Operation(summary = "Get all documents for a project")
    public ResponseEntity<List<CommonDTOs.DocumentDTO>> getDocuments(@PathVariable Long projectId) {
        List<Document> list = documentRepository.findByProjectIdOrderByUploadedAtDesc(projectId);
        List<CommonDTOs.DocumentDTO> dtos = list.stream().map(d -> {
            CommonDTOs.DocumentDTO dto = new CommonDTOs.DocumentDTO();
            dto.setId(d.getId());
            dto.setProjectId(d.getProject().getId());
            dto.setProjectName(d.getProject().getProjectName());
            dto.setTitle(d.getTitle());
            dto.setDocumentType(d.getDocumentType());
            dto.setFileUrl(d.getFileUrl());
            dto.setFileSize(d.getFileSize());
            dto.setUploadedBy(d.getUploadedBy());
            dto.setUploadedAt(d.getUploadedAt());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Operation(summary = "Attach new document metadata to project")
    public ResponseEntity<CommonDTOs.DocumentDTO> addDocument(
            @PathVariable Long projectId,
            @RequestBody CommonDTOs.DocumentDTO req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        String uploader = userPrincipal != null ? userPrincipal.getFullName() : "Field Engineer";
        Document doc = new Document(
                project,
                req.getTitle(),
                req.getDocumentType() != null ? req.getDocumentType() : "INSPECTION_REPORT",
                req.getFileUrl() != null ? req.getFileUrl() : "https://pragati.gov.in/docs/sample.pdf",
                req.getFileSize() != null ? req.getFileSize() : 2048576L,
                uploader
        );

        Document saved = documentRepository.save(doc);

        req.setId(saved.getId());
        req.setProjectId(project.getId());
        req.setProjectName(project.getProjectName());
        req.setUploadedBy(uploader);
        req.setUploadedAt(saved.getUploadedAt());

        return ResponseEntity.ok(req);
    }
}
