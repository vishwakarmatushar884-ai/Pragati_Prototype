package gov.pragati.controller;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Automated reporting and PDF/CSV export engine")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/generate")
    @Operation(summary = "Generate live dynamic report data with applied filters")
    public ResponseEntity<CommonDTOs.ReportSummaryDTO> generateReport(
            @RequestParam(defaultValue = "PORTFOLIO_SUMMARY") String reportType,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskLevel,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String officer = userPrincipal != null ? userPrincipal.getFullName() : "Government Officer";
        CommonDTOs.ReportSummaryDTO report = reportService.generateReport(reportType, ministry, state, sector, riskLevel, officer);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export live filtered reports as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(defaultValue = "PORTFOLIO_SUMMARY") String reportType,
            @RequestParam(required = false) String ministry,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String riskLevel) {
        byte[] csvData = reportService.exportToCsv(reportType, ministry, state, sector, riskLevel);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=PRAGATI_Project_Report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }
}
