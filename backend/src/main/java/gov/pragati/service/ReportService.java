package gov.pragati.service;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.dto.DashboardDTOs;
import gov.pragati.dto.ProjectDTOs;
import gov.pragati.entity.Project;
import gov.pragati.repository.ProjectRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ProjectRepository projectRepository;
    private final ProjectService projectService;
    private final DashboardService dashboardService;

    public ReportService(ProjectRepository projectRepository,
                         ProjectService projectService,
                         DashboardService dashboardService) {
        this.projectRepository = projectRepository;
        this.projectService = projectService;
        this.dashboardService = dashboardService;
    }

    public CommonDTOs.ReportSummaryDTO generateReport(String reportType, String ministry, String state, String sector, String riskLevel, String generatedBy) {
        List<Project> filtered = projectRepository.findWithFilters(ministry, state, sector, riskLevel, null, null);

        CommonDTOs.ReportSummaryDTO dto = new CommonDTOs.ReportSummaryDTO();
        dto.setReportType(reportType != null ? reportType : "PORTFOLIO_SUMMARY");
        dto.setGeneratedAt(LocalDateTime.now());
        dto.setGeneratedBy(generatedBy != null ? generatedBy : "Government Officer");

        Map<String, String> filters = new HashMap<>();
        if (ministry != null) filters.put("Ministry", ministry);
        if (state != null) filters.put("State", state);
        if (sector != null) filters.put("Sector", sector);
        if (riskLevel != null) filters.put("Risk Level", riskLevel);
        dto.setFiltersApplied(filters);

        dto.setSummary(dashboardService.getPortfolioSummary(ministry, state, sector, riskLevel));
        dto.setProjects(filtered.stream().map(projectService::toDTO).collect(Collectors.toList()));

        return dto;
    }

    public byte[] exportToCsv(String reportType, String ministry, String state, String sector, String riskLevel) {
        List<Project> projects = projectRepository.findWithFilters(ministry, state, sector, riskLevel, null, null);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT.builder()
                .setHeader("Project Code", "Project Name", "Ministry", "Sector", "State", "Budget (Cr)", "Actual Cost (Cr)", "Physical Progress %", "Planned Progress %", "SPI", "CPI", "Risk Level", "Health Score", "Status", "AI Predicted Delay (Days)")
                .build())) {

            for (Project p : projects) {
                printer.printRecord(
                        p.getProjectCode(),
                        p.getProjectName(),
                        p.getMinistry(),
                        p.getSector(),
                        p.getState(),
                        p.getProjectBudget(),
                        p.getActualCost(),
                        p.getPhysicalProgress(),
                        p.getPlannedProgress(),
                        p.getSpi(),
                        p.getCpi(),
                        p.getRiskLevel(),
                        p.getHealthScore(),
                        p.getCurrentStatus(),
                        p.getAiPredictedDelayDays()
                );
            }
            printer.flush();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }
}
