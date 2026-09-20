package gov.pragati.controller;

import gov.pragati.dto.DashboardDTOs;
import gov.pragati.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Live Portfolio Analytics, KPI cards, and charts")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/portfolio")
    @Operation(summary = "Get executive portfolio summary KPIs with filter support")
    public ResponseEntity<DashboardDTOs.PortfolioSummaryDTO> getPortfolioSummary(
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskLevel) {
        DashboardDTOs.PortfolioSummaryDTO summary = dashboardService.getPortfolioSummary(ministry, state, sector, riskLevel);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/risk-distribution")
    @Operation(summary = "Get risk category counts")
    public ResponseEntity<DashboardDTOs.RiskDistributionDTO> getRiskDistribution(
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector) {
        DashboardDTOs.RiskDistributionDTO dist = dashboardService.getRiskDistribution(ministry, state, sector);
        return ResponseEntity.ok(dist);
    }

    @GetMapping("/ministries")
    @Operation(summary = "Get ministry-wise project statistics")
    public ResponseEntity<List<DashboardDTOs.MinistryStatDTO>> getMinistryStats() {
        return ResponseEntity.ok(dashboardService.getMinistryStats());
    }

    @GetMapping("/sectors")
    @Operation(summary = "Get sector-wise project distribution")
    public ResponseEntity<List<DashboardDTOs.SectorStatDTO>> getSectorStats() {
        return ResponseEntity.ok(dashboardService.getSectorStats());
    }

    @GetMapping("/trends")
    @Operation(summary = "Get monthly progress and expenditure trends")
    public ResponseEntity<List<DashboardDTOs.MonthlyTrendItemDTO>> getMonthlyTrends(
            @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(dashboardService.getMonthlyTrends(projectId));
    }

    @GetMapping("/top-risk")
    @Operation(summary = "Get Top 10 at-risk projects requiring urgent attention")
    public ResponseEntity<List<DashboardDTOs.TopRiskProjectDTO>> getTopRiskProjects(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopRiskProjects(limit));
    }
}
