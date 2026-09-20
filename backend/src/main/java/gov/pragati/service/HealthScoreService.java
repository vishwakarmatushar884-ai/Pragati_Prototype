package gov.pragati.service;

import gov.pragati.entity.Project;
import gov.pragati.entity.SystemSetting;
import gov.pragati.repository.IssueRepository;
import gov.pragati.repository.MilestoneRepository;
import gov.pragati.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class HealthScoreService {

    private final MilestoneRepository milestoneRepository;
    private final IssueRepository issueRepository;
    private final SystemSettingRepository settingRepository;

    public HealthScoreService(MilestoneRepository milestoneRepository,
                              IssueRepository issueRepository,
                              SystemSettingRepository settingRepository) {
        this.milestoneRepository = milestoneRepository;
        this.issueRepository = issueRepository;
        this.settingRepository = settingRepository;
    }

    public int calculateHealthScore(Project project, long overdueMilestones, long criticalIssues, long openIssues) {
        // Load configurable weights or defaults
        double weightSchedule = getWeight("weight_schedule", 30.0);
        double weightCost = getWeight("weight_cost", 25.0);
        double weightMilestone = getWeight("weight_milestone", 20.0);
        double weightIssues = getWeight("weight_issues", 15.0);
        double weightRegularity = getWeight("weight_regularity", 10.0);

        double totalWeight = weightSchedule + weightCost + weightMilestone + weightIssues + weightRegularity;
        if (totalWeight <= 0) totalWeight = 100.0;

        // 1. Schedule Component (0 - 100)
        double spi = project.getSpi() != null ? project.getSpi() : 1.0;
        double scheduleScore = Math.max(0.0, Math.min(100.0, (spi / 1.0) * 100.0));

        // 2. Cost Component (0 - 100)
        double cpi = project.getCpi() != null ? project.getCpi() : 1.0;
        double costScore = Math.max(0.0, Math.min(100.0, (cpi / 1.0) * 100.0));

        // 3. Milestone Component (0 - 100)
        double milestoneScore = 100.0 - (overdueMilestones * 25.0);
        milestoneScore = Math.max(0.0, Math.min(100.0, milestoneScore));

        // 4. Issue Component (0 - 100)
        double issueScore = 100.0 - (criticalIssues * 30.0) - ((openIssues - criticalIssues) * 8.0);
        issueScore = Math.max(0.0, Math.min(100.0, issueScore));

        // 5. Update Regularity Component (0 - 100)
        double regularityScore = 100.0;
        if (project.getLastUpdated() != null) {
            long daysSinceUpdate = Duration.between(project.getLastUpdated(), LocalDateTime.now()).toDays();
            if (daysSinceUpdate > 14) {
                regularityScore = Math.max(0.0, 100.0 - ((daysSinceUpdate - 14) * 5.0));
            }
        }

        // Weighted sum
        double compositeScore = (
                (scheduleScore * weightSchedule) +
                (costScore * weightCost) +
                (milestoneScore * weightMilestone) +
                (issueScore * weightIssues) +
                (regularityScore * weightRegularity)
        ) / totalWeight;

        int finalScore = (int) Math.round(Math.max(0.0, Math.min(100.0, compositeScore)));
        project.setHealthScore(finalScore);
        return finalScore;
    }

    private double getWeight(String key, double defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(s -> {
                    try {
                        return Double.parseDouble(s.getSettingValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
}
