package gov.pragati.controller;

import gov.pragati.dto.FinancialDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.FinancialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/financials")
@Tag(name = "Financials", description = "Project financial records and expenditure tracking")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping
    @Operation(summary = "Get historical financial and expenditure records for a project")
    public ResponseEntity<List<FinancialDTOs.FinancialRecordDTO>> getFinancials(@PathVariable Long projectId) {
        List<FinancialDTOs.FinancialRecordDTO> list = financialService.getFinancialsByProject(projectId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MINISTRY_ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Add a new financial expenditure record")
    public ResponseEntity<FinancialDTOs.FinancialRecordDTO> addFinancial(
            @PathVariable Long projectId,
            @Valid @RequestBody FinancialDTOs.CreateFinancialRequest req,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String recorder = userPrincipal != null ? userPrincipal.getFullName() : "Accounts Officer";
        FinancialDTOs.FinancialRecordDTO created = financialService.addFinancialRecord(projectId, req, recorder);
        return ResponseEntity.ok(created);
    }
}
