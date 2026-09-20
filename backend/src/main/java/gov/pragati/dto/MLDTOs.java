package gov.pragati.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class MLDTOs {

    public static class MLFeaturesRequest {
        @JsonProperty("project_id")
        private String projectId;
        @JsonProperty("project_name")
        private String projectName;
        private double spi;
        private double cpi;
        @JsonProperty("budget_utilization")
        private double budgetUtilization;
        @JsonProperty("cost_variance_pct")
        private double costVariancePct;
        @JsonProperty("schedule_variance_days")
        private double scheduleVarianceDays;
        @JsonProperty("planned_progress")
        private double plannedProgress;
        @JsonProperty("actual_progress")
        private double actualProgress;
        @JsonProperty("project_age_days")
        private double projectAgeDays;
        @JsonProperty("days_remaining")
        private double daysRemaining;
        @JsonProperty("overdue_milestones_count")
        private int overdueMilestonesCount;
        @JsonProperty("unresolved_issues_count")
        private int unresolvedIssuesCount;
        @JsonProperty("critical_issues_count")
        private int criticalIssuesCount;
        @JsonProperty("anomalies_count")
        private int anomaliesCount;
        @JsonProperty("days_since_last_update")
        private double daysSinceLastUpdate;

        // Getters and Setters
        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public double getSpi() { return spi; }
        public void setSpi(double spi) { this.spi = spi; }
        public double getCpi() { return cpi; }
        public void setCpi(double cpi) { this.cpi = cpi; }
        public double getBudgetUtilization() { return budgetUtilization; }
        public void setBudgetUtilization(double budgetUtilization) { this.budgetUtilization = budgetUtilization; }
        public double getCostVariancePct() { return costVariancePct; }
        public void setCostVariancePct(double costVariancePct) { this.costVariancePct = costVariancePct; }
        public double getScheduleVarianceDays() { return scheduleVarianceDays; }
        public void setScheduleVarianceDays(double scheduleVarianceDays) { this.scheduleVarianceDays = scheduleVarianceDays; }
        public double getPlannedProgress() { return plannedProgress; }
        public void setPlannedProgress(double plannedProgress) { this.plannedProgress = plannedProgress; }
        public double getActualProgress() { return actualProgress; }
        public void setActualProgress(double actualProgress) { this.actualProgress = actualProgress; }
        public double getProjectAgeDays() { return projectAgeDays; }
        public void setProjectAgeDays(double projectAgeDays) { this.projectAgeDays = projectAgeDays; }
        public double getDaysRemaining() { return daysRemaining; }
        public void setDaysRemaining(double daysRemaining) { this.daysRemaining = daysRemaining; }
        public int getOverdueMilestonesCount() { return overdueMilestonesCount; }
        public void setOverdueMilestonesCount(int overdueMilestonesCount) { this.overdueMilestonesCount = overdueMilestonesCount; }
        public int getUnresolvedIssuesCount() { return unresolvedIssuesCount; }
        public void setUnresolvedIssuesCount(int unresolvedIssuesCount) { this.unresolvedIssuesCount = unresolvedIssuesCount; }
        public int getCriticalIssuesCount() { return criticalIssuesCount; }
        public void setCriticalIssuesCount(int criticalIssuesCount) { this.criticalIssuesCount = criticalIssuesCount; }
        public int getAnomaliesCount() { return anomaliesCount; }
        public void setAnomaliesCount(int anomaliesCount) { this.anomaliesCount = anomaliesCount; }
        public double getDaysSinceLastUpdate() { return daysSinceLastUpdate; }
        public void setDaysSinceLastUpdate(double daysSinceLastUpdate) { this.daysSinceLastUpdate = daysSinceLastUpdate; }
    }

    public static class MLRiskResponse {
        @JsonProperty("project_id")
        private String projectId;
        @JsonProperty("risk_level")
        private String riskLevel;
        @JsonProperty("risk_probability")
        private double riskProbability;
        @JsonProperty("class_probabilities")
        private Map<String, Double> classProbabilities;
        @JsonProperty("top_risk_factors")
        private List<String> topRiskFactors;

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public double getRiskProbability() { return riskProbability; }
        public void setRiskProbability(double riskProbability) { this.riskProbability = riskProbability; }
        public Map<String, Double> getClassProbabilities() { return classProbabilities; }
        public void setClassProbabilities(Map<String, Double> classProbabilities) { this.classProbabilities = classProbabilities; }
        public List<String> getTopRiskFactors() { return topRiskFactors; }
        public void setTopRiskFactors(List<String> topRiskFactors) { this.topRiskFactors = topRiskFactors; }
    }

    public static class MLDelayResponse {
        @JsonProperty("project_id")
        private String projectId;
        @JsonProperty("predicted_delay_days")
        private double predictedDelayDays;
        @JsonProperty("delay_probability")
        private double delayProbability;

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        public double getPredictedDelayDays() { return predictedDelayDays; }
        public void setPredictedDelayDays(double predictedDelayDays) { this.predictedDelayDays = predictedDelayDays; }
        public double getDelayProbability() { return delayProbability; }
        public void setDelayProbability(double delayProbability) { this.delayProbability = delayProbability; }
    }

    public static class MLExplainResponse {
        @JsonProperty("project_id")
        private String projectId;
        @JsonProperty("risk_level")
        private String riskLevel;
        @JsonProperty("risk_probability")
        private double riskProbability;
        @JsonProperty("delay_probability")
        private double delayProbability;
        @JsonProperty("predicted_delay_days")
        private double predictedDelayDays;
        @JsonProperty("ai_summary")
        private String aiSummary;
        @JsonProperty("top_contributing_factors")
        private List<String> topContributingFactors;
        @JsonProperty("feature_contributions")
        private List<Map<String, Object>> featureContributions;

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public double getRiskProbability() { return riskProbability; }
        public void setRiskProbability(double riskProbability) { this.riskProbability = riskProbability; }
        public double getDelayProbability() { return delayProbability; }
        public void setDelayProbability(double delayProbability) { this.delayProbability = delayProbability; }
        public double getPredictedDelayDays() { return predictedDelayDays; }
        public void setPredictedDelayDays(double predictedDelayDays) { this.predictedDelayDays = predictedDelayDays; }
        public String getAiSummary() { return aiSummary; }
        public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
        public List<String> getTopContributingFactors() { return topContributingFactors; }
        public void setTopContributingFactors(List<String> topContributingFactors) { this.topContributingFactors = topContributingFactors; }
        public List<Map<String, Object>> getFeatureContributions() { return featureContributions; }
        public void setFeatureContributions(List<Map<String, Object>> featureContributions) { this.featureContributions = featureContributions; }
    }
}
