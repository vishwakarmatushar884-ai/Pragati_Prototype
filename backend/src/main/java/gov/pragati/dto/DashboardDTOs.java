package gov.pragati.dto;

import java.util.List;
import java.util.Map;

public class DashboardDTOs {

    public static class PortfolioSummaryDTO {
        private long totalProjects;
        private double totalApprovedBudget;
        private double totalActualExpenditure;
        private double totalPlannedCost;
        private double totalEarnedValue;
        private double averagePhysicalProgress;
        private double averagePlannedProgress;
        private double averageSpi;
        private double averageCpi;
        private long onTrackProjects;
        private long delayedProjects;
        private long completedProjects;
        private long lowRiskCount;
        private long mediumRiskCount;
        private long highRiskCount;
        private long criticalRiskCount;
        private long openIssuesCount;
        private long criticalIssuesCount;
        private long unresolvedAlertsCount;
        private long activeAnomaliesCount;

        // Getters and Setters
        public long getTotalProjects() { return totalProjects; }
        public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
        public double getTotalApprovedBudget() { return totalApprovedBudget; }
        public void setTotalApprovedBudget(double totalApprovedBudget) { this.totalApprovedBudget = totalApprovedBudget; }
        public double getTotalActualExpenditure() { return totalActualExpenditure; }
        public void setTotalActualExpenditure(double totalActualExpenditure) { this.totalActualExpenditure = totalActualExpenditure; }
        public double getTotalPlannedCost() { return totalPlannedCost; }
        public void setTotalPlannedCost(double totalPlannedCost) { this.totalPlannedCost = totalPlannedCost; }
        public double getTotalEarnedValue() { return totalEarnedValue; }
        public void setTotalEarnedValue(double totalEarnedValue) { this.totalEarnedValue = totalEarnedValue; }
        public double getAveragePhysicalProgress() { return averagePhysicalProgress; }
        public void setAveragePhysicalProgress(double averagePhysicalProgress) { this.averagePhysicalProgress = averagePhysicalProgress; }
        public double getAveragePlannedProgress() { return averagePlannedProgress; }
        public void setAveragePlannedProgress(double averagePlannedProgress) { this.averagePlannedProgress = averagePlannedProgress; }
        public double getAverageSpi() { return averageSpi; }
        public void setAverageSpi(double averageSpi) { this.averageSpi = averageSpi; }
        public double getAverageCpi() { return averageCpi; }
        public void setAverageCpi(double averageCpi) { this.averageCpi = averageCpi; }
        public long getOnTrackProjects() { return onTrackProjects; }
        public void setOnTrackProjects(long onTrackProjects) { this.onTrackProjects = onTrackProjects; }
        public long getDelayedProjects() { return delayedProjects; }
        public void setDelayedProjects(long delayedProjects) { this.delayedProjects = delayedProjects; }
        public long getCompletedProjects() { return completedProjects; }
        public void setCompletedProjects(long completedProjects) { this.completedProjects = completedProjects; }
        public long getLowRiskCount() { return lowRiskCount; }
        public void setLowRiskCount(long lowRiskCount) { this.lowRiskCount = lowRiskCount; }
        public long getMediumRiskCount() { return mediumRiskCount; }
        public void setMediumRiskCount(long mediumRiskCount) { this.mediumRiskCount = mediumRiskCount; }
        public long getHighRiskCount() { return highRiskCount; }
        public void setHighRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; }
        public long getCriticalRiskCount() { return criticalRiskCount; }
        public void setCriticalRiskCount(long criticalRiskCount) { this.criticalRiskCount = criticalRiskCount; }
        public long getOpenIssuesCount() { return openIssuesCount; }
        public void setOpenIssuesCount(long openIssuesCount) { this.openIssuesCount = openIssuesCount; }
        public long getCriticalIssuesCount() { return criticalIssuesCount; }
        public void setCriticalIssuesCount(long criticalIssuesCount) { this.criticalIssuesCount = criticalIssuesCount; }
        public long getUnresolvedAlertsCount() { return unresolvedAlertsCount; }
        public void setUnresolvedAlertsCount(long unresolvedAlertsCount) { this.unresolvedAlertsCount = unresolvedAlertsCount; }
        public long getActiveAnomaliesCount() { return activeAnomaliesCount; }
        public void setActiveAnomaliesCount(long activeAnomaliesCount) { this.activeAnomaliesCount = activeAnomaliesCount; }
    }

    public static class RiskDistributionDTO {
        private long low;
        private long medium;
        private long high;
        private long critical;

        public RiskDistributionDTO() {}
        public RiskDistributionDTO(long low, long medium, long high, long critical) {
            this.low = low;
            this.medium = medium;
            this.high = high;
            this.critical = critical;
        }
        public long getLow() { return low; }
        public void setLow(long low) { this.low = low; }
        public long getMedium() { return medium; }
        public void setMedium(long medium) { this.medium = medium; }
        public long getHigh() { return high; }
        public void setHigh(long high) { this.high = high; }
        public long getCritical() { return critical; }
        public void setCritical(long critical) { this.critical = critical; }
    }

    public static class MinistryStatDTO {
        private String ministry;
        private long totalProjects;
        private double totalBudget;
        private double totalExpenditure;
        private double avgProgress;
        private long highRiskCount;

        public MinistryStatDTO() {}
        public MinistryStatDTO(String ministry, long totalProjects, double totalBudget, double totalExpenditure, double avgProgress, long highRiskCount) {
            this.ministry = ministry;
            this.totalProjects = totalProjects;
            this.totalBudget = totalBudget;
            this.totalExpenditure = totalExpenditure;
            this.avgProgress = avgProgress;
            this.highRiskCount = highRiskCount;
        }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public long getTotalProjects() { return totalProjects; }
        public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
        public double getTotalBudget() { return totalBudget; }
        public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }
        public double getTotalExpenditure() { return totalExpenditure; }
        public void setTotalExpenditure(double totalExpenditure) { this.totalExpenditure = totalExpenditure; }
        public double getAvgProgress() { return avgProgress; }
        public void setAvgProgress(double avgProgress) { this.avgProgress = avgProgress; }
        public long getHighRiskCount() { return highRiskCount; }
        public void setHighRiskCount(long highRiskCount) { this.highRiskCount = highRiskCount; }
    }

    public static class SectorStatDTO {
        private String sector;
        private long count;
        private double totalBudget;
        private double avgProgress;

        public SectorStatDTO() {}
        public SectorStatDTO(String sector, long count, double totalBudget, double avgProgress) {
            this.sector = sector;
            this.count = count;
            this.totalBudget = totalBudget;
            this.avgProgress = avgProgress;
        }
        public String getSector() { return sector; }
        public void setSector(String sector) { this.sector = sector; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public double getTotalBudget() { return totalBudget; }
        public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }
        public double getAvgProgress() { return avgProgress; }
        public void setAvgProgress(double avgProgress) { this.avgProgress = avgProgress; }
    }

    public static class MonthlyTrendItemDTO {
        private String month;
        private double plannedProgress;
        private double actualProgress;
        private double plannedSpend;
        private double actualSpend;
        private double spi;
        private double cpi;

        public MonthlyTrendItemDTO() {}
        public MonthlyTrendItemDTO(String month, double plannedProgress, double actualProgress, double plannedSpend, double actualSpend, double spi, double cpi) {
            this.month = month;
            this.plannedProgress = plannedProgress;
            this.actualProgress = actualProgress;
            this.plannedSpend = plannedSpend;
            this.actualSpend = actualSpend;
            this.spi = spi;
            this.cpi = cpi;
        }
        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        public double getPlannedProgress() { return plannedProgress; }
        public void setPlannedProgress(double plannedProgress) { this.plannedProgress = plannedProgress; }
        public double getActualProgress() { return actualProgress; }
        public void setActualProgress(double actualProgress) { this.actualProgress = actualProgress; }
        public double getPlannedSpend() { return plannedSpend; }
        public void setPlannedSpend(double plannedSpend) { this.plannedSpend = plannedSpend; }
        public double getActualSpend() { return actualSpend; }
        public void setActualSpend(double actualSpend) { this.actualSpend = actualSpend; }
        public double getSpi() { return spi; }
        public void setSpi(double spi) { this.spi = spi; }
        public double getCpi() { return cpi; }
        public void setCpi(double cpi) { this.cpi = cpi; }
    }

    public static class TopRiskProjectDTO {
        private Long id;
        private String projectCode;
        private String projectName;
        private String ministry;
        private String state;
        private String riskLevel;
        private Integer healthScore;
        private Double spi;
        private Double cpi;
        private Double physicalProgress;
        private Double aiPredictedDelayDays;
        private String topRiskFactor;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getMinistry() { return ministry; }
        public void setMinistry(String ministry) { this.ministry = ministry; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
        public Double getSpi() { return spi; }
        public void setSpi(Double spi) { this.spi = spi; }
        public Double getCpi() { return cpi; }
        public void setCpi(Double cpi) { this.cpi = cpi; }
        public Double getPhysicalProgress() { return physicalProgress; }
        public void setPhysicalProgress(Double physicalProgress) { this.physicalProgress = physicalProgress; }
        public Double getAiPredictedDelayDays() { return aiPredictedDelayDays; }
        public void setAiPredictedDelayDays(Double aiPredictedDelayDays) { this.aiPredictedDelayDays = aiPredictedDelayDays; }
        public String getTopRiskFactor() { return topRiskFactor; }
        public void setTopRiskFactor(String topRiskFactor) { this.topRiskFactor = topRiskFactor; }
    }
}
