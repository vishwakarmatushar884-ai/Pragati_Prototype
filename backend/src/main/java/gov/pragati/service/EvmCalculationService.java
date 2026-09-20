package gov.pragati.service;

import gov.pragati.entity.Project;
import gov.pragati.entity.RiskThreshold;
import gov.pragati.repository.RiskThresholdRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvmCalculationService {

    private final RiskThresholdRepository riskThresholdRepository;

    public EvmCalculationService(RiskThresholdRepository riskThresholdRepository) {
        this.riskThresholdRepository = riskThresholdRepository;
    }

    public void recalculateEvmMetrics(Project project) {
        double budget = project.getProjectBudget() != null && project.getProjectBudget() > 0 ? project.getProjectBudget() : 1.0;
        double plannedProg = project.getPlannedProgress() != null ? project.getPlannedProgress() : 0.0;
        double physicalProg = project.getPhysicalProgress() != null ? project.getPhysicalProgress() : 0.0;
        double actualCost = project.getActualCost() != null ? project.getActualCost() : 0.0;

        // Planned Value: PV = (Planned Progress % / 100) * Budget
        double plannedValue = (plannedProg / 100.0) * budget;
        project.setPlannedCost(Math.round(plannedValue * 100.0) / 100.0);

        // Earned Value: EV = (Physical Progress % / 100) * Budget
        double earnedValue = (physicalProg / 100.0) * budget;
        project.setEarnedValue(Math.round(earnedValue * 100.0) / 100.0);

        // Financial Progress %: (Actual Cost / Budget) * 100
        double financialProg = (actualCost / budget) * 100.0;
        project.setFinancialProgress(Math.round(financialProg * 10.0) / 10.0);

        // Schedule Performance Index: SPI = EV / PV (safe division)
        double spi;
        if (plannedValue <= 0.0001) {
            spi = physicalProg > 0 ? 1.0 : 1.0;
        } else {
            spi = earnedValue / plannedValue;
        }
        project.setSpi(Math.round(spi * 100.0) / 100.0);

        // Cost Performance Index: CPI = EV / AC (safe division)
        double cpi;
        if (actualCost <= 0.0001) {
            cpi = earnedValue > 0 ? 1.0 : 1.0;
        } else {
            cpi = earnedValue / actualCost;
        }
        project.setCpi(Math.round(cpi * 100.0) / 100.0);

        // Variances
        double scheduleVariance = earnedValue - plannedValue; // SV = EV - PV
        double costVariance = earnedValue - actualCost;       // CV = EV - AC

        project.setScheduleVariance(Math.round(scheduleVariance * 100.0) / 100.0);
        project.setCostVariance(Math.round(costVariance * 100.0) / 100.0);

        // Update Risk Level based on thresholds
        String risk = determineRiskLevel(project.getSpi(), project.getCpi(), project.getHealthScore());
        project.setRiskLevel(risk);
    }

    public String determineRiskLevel(Double spi, Double cpi, Integer healthScore) {
        double s = spi != null ? spi : 1.0;
        double c = cpi != null ? cpi : 1.0;
        int h = healthScore != null ? healthScore : 100;

        // Check configurable thresholds if available
        List<RiskThreshold> thresholds = riskThresholdRepository.findAll();
        if (!thresholds.isEmpty()) {
            for (RiskThreshold t : thresholds) {
                if ("CRITICAL".equalsIgnoreCase(t.getRiskLevel())) {
                    if (s < t.getMaxSpi() || c < t.getMaxCpi() || (t.getMaxHealthScore() != null && h < t.getMaxHealthScore())) {
                        return "CRITICAL";
                    }
                }
            }
        }

        // Standard Default Rules
        if (s < 0.75 || c < 0.75 || h < 40) {
            return "CRITICAL";
        } else if ((s >= 0.75 && s < 0.85) || (c >= 0.75 && c < 0.85) || (h >= 40 && h < 60)) {
            return "HIGH";
        } else if ((s >= 0.85 && s < 0.95) || (c >= 0.85 && c < 0.95) || (h >= 60 && h < 80)) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
