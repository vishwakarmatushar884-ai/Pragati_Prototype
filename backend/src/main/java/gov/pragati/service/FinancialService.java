package gov.pragati.service;

import gov.pragati.dto.FinancialDTOs;
import gov.pragati.entity.AuditAction;
import gov.pragati.entity.FinancialRecord;
import gov.pragati.entity.Project;
import gov.pragati.exception.ResourceNotFoundException;
import gov.pragati.repository.FinancialRecordRepository;
import gov.pragati.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialService {

    private final FinancialRecordRepository financialRepository;
    private final ProjectRepository projectRepository;
    private final AuditService auditService;
    private final EvmCalculationService evmCalculationService;

    public FinancialService(FinancialRecordRepository financialRepository,
                            ProjectRepository projectRepository,
                            AuditService auditService,
                            EvmCalculationService evmCalculationService) {
        this.financialRepository = financialRepository;
        this.projectRepository = projectRepository;
        this.auditService = auditService;
        this.evmCalculationService = evmCalculationService;
    }

    public List<FinancialDTOs.FinancialRecordDTO> getFinancialsByProject(Long projectId) {
        List<FinancialRecord> list = financialRepository.findByProjectIdOrderByRecordMonthAsc(projectId);
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public FinancialDTOs.FinancialRecordDTO addFinancialRecord(Long projectId, FinancialDTOs.CreateFinancialRequest req, String recordedBy) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        FinancialRecord record = new FinancialRecord();
        record.setProject(project);
        record.setFiscalYear(req.getFiscalYear());
        record.setRecordMonth(req.getRecordMonth());
        record.setPlannedExpenditure(req.getPlannedExpenditure());
        record.setActualExpenditure(req.getActualExpenditure());
        record.setCommittedExpenditure(req.getCommittedExpenditure() != null ? req.getCommittedExpenditure() : 0.0);

        // Compute cumulative
        List<FinancialRecord> existing = financialRepository.findByProjectIdOrderByRecordMonthAsc(projectId);
        double prevCumulative = existing.stream().mapToDouble(FinancialRecord::getActualExpenditure).sum();
        double currentCumulative = prevCumulative + req.getActualExpenditure();
        record.setCumulativeExpenditure(currentCumulative);

        record.setCostVariance(req.getPlannedExpenditure() - req.getActualExpenditure());

        double cpi = req.getActualExpenditure() > 0 ? (project.getEarnedValue() != null ? project.getEarnedValue() : 0) / currentCumulative : 1.0;
        record.setCpiAtRecord(Math.round(cpi * 100.0) / 100.0);

        record.setRemarks(req.getRemarks());
        record.setRecordedBy(recordedBy != null ? recordedBy : "Accounts Officer");
        record.setCreatedAt(LocalDateTime.now());

        FinancialRecord saved = financialRepository.save(record);

        // Update Project actual cost
        project.setActualCost(currentCumulative);
        evmCalculationService.recalculateEvmMetrics(project);
        projectRepository.save(project);

        auditService.logAction(AuditAction.UPDATE_PROJECT, "FinancialRecord", saved.getId(), req.getRecordMonth(),
                null, "₹" + req.getActualExpenditure() + " Cr", "Added expenditure entry for " + req.getRecordMonth());

        return toDTO(saved);
    }

    public FinancialDTOs.FinancialRecordDTO toDTO(FinancialRecord f) {
        FinancialDTOs.FinancialRecordDTO dto = new FinancialDTOs.FinancialRecordDTO();
        dto.setId(f.getId());
        if (f.getProject() != null) {
            dto.setProjectId(f.getProject().getId());
            dto.setProjectName(f.getProject().getProjectName());
        }
        dto.setFiscalYear(f.getFiscalYear());
        dto.setRecordMonth(f.getRecordMonth());
        dto.setPlannedExpenditure(f.getPlannedExpenditure());
        dto.setActualExpenditure(f.getActualExpenditure());
        dto.setCommittedExpenditure(f.getCommittedExpenditure());
        dto.setCumulativeExpenditure(f.getCumulativeExpenditure());
        dto.setCostVariance(f.getCostVariance());
        dto.setCpiAtRecord(f.getCpiAtRecord());
        dto.setRemarks(f.getRemarks());
        dto.setRecordedBy(f.getRecordedBy());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }
}
