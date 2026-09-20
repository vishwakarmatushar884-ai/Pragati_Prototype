package gov.pragati.service;

import gov.pragati.entity.*;
import gov.pragati.repository.AnomalyRepository;
import gov.pragati.repository.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnomalyDetectionService {

    private final AnomalyRepository anomalyRepository;
    private final MilestoneRepository milestoneRepository;

    public AnomalyDetectionService(AnomalyRepository anomalyRepository, MilestoneRepository milestoneRepository) {
        this.anomalyRepository = anomalyRepository;
        this.milestoneRepository = milestoneRepository;
    }

    public List<Anomaly> evaluateAnomalies(Project project, Double prevPhysicalProgress, Double prevActualCost) {
        List<Anomaly> detected = new ArrayList<>();

        double physicalProg = project.getPhysicalProgress() != null ? project.getPhysicalProgress() : 0.0;
        double financialProg = project.getFinancialProgress() != null ? project.getFinancialProgress() : 0.0;
        double actualCost = project.getActualCost() != null ? project.getActualCost() : 0.0;
        double budget = project.getProjectBudget() != null ? project.getProjectBudget() : 0.0;
        double approvedCost = project.getApprovedCost() != null && project.getApprovedCost() > 0 ? project.getApprovedCost() : budget;

        // 1. Financial progress >> Physical progress (Gap > 25%)
        if (financialProg - physicalProg > 25.0 && physicalProg < 90.0) {
            detected.add(new Anomaly(
                    project,
                    "FINANCIAL_EXCEEDS_PHYSICAL",
                    String.format("Financial expenditure (%.1f%%) is significantly outpacing physical progress (%.1f%%) with a %.1f%% variance gap.",
                            financialProg, physicalProg, financialProg - physicalProg),
                    AnomalySeverity.HIGH
            ));
        }

        // 2. Physical progress increasing without expenditure update
        if (prevPhysicalProgress != null && (physicalProg - prevPhysicalProgress > 15.0)) {
            if (prevActualCost != null && Math.abs(actualCost - prevActualCost) < 0.01 && actualCost < (budget * 0.2)) {
                detected.add(new Anomaly(
                        project,
                        "PROGRESS_WITHOUT_EXPENDITURE",
                        String.format("Physical progress jumped by %.1f%% (from %.1f%% to %.1f%%) without any corresponding expenditure recorded.",
                                physicalProg - prevPhysicalProgress, prevPhysicalProgress, physicalProg),
                        AnomalySeverity.MEDIUM
                ));
            }
        }

        // 3. Cost increasing while progress remains stagnant
        if (prevActualCost != null && (actualCost - prevActualCost > (budget * 0.10))) {
            if (prevPhysicalProgress != null && Math.abs(physicalProg - prevPhysicalProgress) < 0.1) {
                detected.add(new Anomaly(
                        project,
                        "COST_INCREASE_STAGNANT_PROGRESS",
                        String.format("Expenditure increased by ₹%.2f Cr while physical progress remained completely unchanged at %.1f%%.",
                                actualCost - prevActualCost, physicalProg),
                        AnomalySeverity.HIGH
                ));
            }
        }

        // 4. Budget Overrun
        if (actualCost > approvedCost) {
            detected.add(new Anomaly(
                    project,
                    "BUDGET_OVERRUN",
                    String.format("Actual expenditure (₹%.2f Cr) has exceeded the total approved budget (₹%.2f Cr) by ₹%.2f Cr.",
                            actualCost, approvedCost, actualCost - approvedCost),
                    AnomalySeverity.CRITICAL
            ));
        }

        // 5. Abrupt Progress Jump (> 35% in a single update)
        if (prevPhysicalProgress != null && (physicalProg - prevPhysicalProgress > 35.0)) {
            detected.add(new Anomaly(
                    project,
                    "ABRUPT_PROGRESS_SPIKE",
                    String.format("Abnormal progress increase of %.1f%% detected in a single submission. Verification recommended.",
                            physicalProg - prevPhysicalProgress),
                    AnomalySeverity.MEDIUM
            ));
        }

        // 6. Planned completion date passed but project still active without revision
        if (project.getPlannedEndDate() != null && project.getPlannedEndDate().isBefore(LocalDate.now())) {
            if (project.getActualCompletionDate() == null && !"COMPLETED".equalsIgnoreCase(project.getCurrentStatus())) {
                long daysPast = ChronoUnit.DAYS.between(project.getPlannedEndDate(), LocalDate.now());
                if (project.getRevisedEndDate() == null || project.getRevisedEndDate().isBefore(LocalDate.now())) {
                    detected.add(new Anomaly(
                            project,
                            "TARGET_DATE_BREACHED",
                            String.format("Project is %d days past planned end date (%s) but status is still active.",
                                    daysPast, project.getPlannedEndDate()),
                            AnomalySeverity.HIGH
                    ));
                }
            }
        }

        // 7. Milestone consistency check
        List<Milestone> milestones = milestoneRepository.findByProjectId(project.getId());
        for (Milestone m : milestones) {
            if (m.getStatus() == MilestoneStatus.COMPLETED && (m.getActualProgress() == null || m.getActualProgress() < 99.0)) {
                detected.add(new Anomaly(
                        project,
                        "INCONSISTENT_MILESTONE_STATUS",
                        String.format("Milestone '%s' is marked COMPLETED while recorded progress is only %.1f%%.",
                                m.getName(), m.getActualProgress() != null ? m.getActualProgress() : 0.0),
                        AnomalySeverity.MEDIUM
                ));
                break;
            }
        }

        // Save newly detected anomalies
        for (Anomaly a : detected) {
            // Check if similar active anomaly already exists to prevent duplication
            List<Anomaly> existing = anomalyRepository.findByProjectIdAndStatus(project.getId(), AnomalyStatus.DETECTED);
            boolean alreadyLogged = existing.stream().anyMatch(e -> e.getAnomalyType().equals(a.getAnomalyType()));
            if (!alreadyLogged) {
                anomalyRepository.save(a);
            }
        }

        return detected;
    }
}
