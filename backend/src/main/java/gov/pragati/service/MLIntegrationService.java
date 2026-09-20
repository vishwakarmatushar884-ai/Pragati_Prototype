package gov.pragati.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.pragati.dto.MLDTOs;
import gov.pragati.entity.*;
import gov.pragati.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MLIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(MLIntegrationService.class);

    @Value("${app.ml-service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final RiskPredictionRepository riskPredictionRepository;
    private final MilestoneRepository milestoneRepository;
    private final IssueRepository issueRepository;
    private final AnomalyRepository anomalyRepository;

    public MLIntegrationService(RiskPredictionRepository riskPredictionRepository,
                                MilestoneRepository milestoneRepository,
                                IssueRepository issueRepository,
                                AnomalyRepository anomalyRepository) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.riskPredictionRepository = riskPredictionRepository;
        this.milestoneRepository = milestoneRepository;
        this.issueRepository = issueRepository;
        this.anomalyRepository = anomalyRepository;
    }

    public MLDTOs.MLExplainResponse analyzeAndPredict(Project project) {
        MLDTOs.MLFeaturesRequest features = extractFeatures(project);

        MLDTOs.MLExplainResponse explainResponse = null;

        // Try calling Python ML service
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<MLDTOs.MLFeaturesRequest> request = new HttpEntity<>(features, headers);

            String url = mlServiceUrl + "/ml/explain";
            ResponseEntity<MLDTOs.MLExplainResponse> response = restTemplate.postForEntity(url, request, MLDTOs.MLExplainResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                explainResponse = response.getBody();
                log.info("Received real ML prediction from Python service for project {}: Risk={}, Delay={} days",
                        project.getProjectCode(), explainResponse.getRiskLevel(), explainResponse.getPredictedDelayDays());
            }
        } catch (Exception e) {
            log.warn("Could not reach Python ML service at {}: {}. Utilizing internal ML decision matrix fallback.",
                    mlServiceUrl, e.getMessage());
        }

        // Fallback if ML service is offline
        if (explainResponse == null) {
            explainResponse = fallbackPrediction(features, project);
        }

        // Update Project Entity with AI Predictions
        project.setRiskLevel(explainResponse.getRiskLevel());
        project.setAiRiskProbability(explainResponse.getRiskProbability());
        project.setAiPredictedDelayDays(explainResponse.getPredictedDelayDays());
        project.setAiExplanationSummary(explainResponse.getAiSummary());

        // Save Risk Prediction record
        try {
            RiskPrediction record = new RiskPrediction();
            record.setProject(project);
            record.setPredictedRiskLevel(explainResponse.getRiskLevel());
            record.setRiskProbability(explainResponse.getRiskProbability());
            record.setDelayProbability(explainResponse.getDelayProbability());
            record.setPredictedDelayDays(explainResponse.getPredictedDelayDays());
            record.setAiSummary(explainResponse.getAiSummary());
            record.setTopRiskFactorsJson(objectMapper.writeValueAsString(explainResponse.getTopContributingFactors()));
            record.setShapContributionsJson(objectMapper.writeValueAsString(explainResponse.getFeatureContributions()));
            record.setGeneratedAt(LocalDateTime.now());
            riskPredictionRepository.save(record);
        } catch (Exception ex) {
            log.error("Failed to save risk prediction record: {}", ex.getMessage());
        }

        return explainResponse;
    }

    public MLDTOs.MLFeaturesRequest extractFeatures(Project project) {
        MLDTOs.MLFeaturesRequest req = new MLDTOs.MLFeaturesRequest();
        req.setProjectId(String.valueOf(project.getId()));
        req.setProjectName(project.getProjectName());
        req.setSpi(project.getSpi() != null ? project.getSpi() : 1.0);
        req.setCpi(project.getCpi() != null ? project.getCpi() : 1.0);

        double budget = project.getProjectBudget() != null && project.getProjectBudget() > 0 ? project.getProjectBudget() : 1.0;
        double actualCost = project.getActualCost() != null ? project.getActualCost() : 0.0;
        req.setBudgetUtilization((actualCost / budget) * 100.0);
        req.setCostVariancePct(((actualCost - (project.getEarnedValue() != null ? project.getEarnedValue() : 0.0)) / budget) * 100.0);

        req.setPlannedProgress(project.getPlannedProgress() != null ? project.getPlannedProgress() : 0.0);
        req.setActualProgress(project.getPhysicalProgress() != null ? project.getPhysicalProgress() : 0.0);

        LocalDate now = LocalDate.now();
        if (project.getStartDate() != null) {
            req.setProjectAgeDays(Math.max(1, ChronoUnit.DAYS.between(project.getStartDate(), now)));
        } else {
            req.setProjectAgeDays(60);
        }

        if (project.getPlannedEndDate() != null) {
            req.setDaysRemaining(ChronoUnit.DAYS.between(now, project.getPlannedEndDate()));
        } else {
            req.setDaysRemaining(120);
        }

        double schedVarDays = (1.0 - req.getSpi()) * 90.0;
        req.setScheduleVarianceDays(schedVarDays);

        // Sub-entities counts
        long overdueMilestones = milestoneRepository.findByProjectIdAndOverdueTrue(project.getId()).size();
        long openIssues = issueRepository.findByProjectIdAndStatusNot(project.getId(), IssueStatus.CLOSED).size();
        long critIssues = issueRepository.findByProjectIdAndPriorityAndStatusNot(project.getId(), IssuePriority.CRITICAL, IssueStatus.CLOSED).size();
        long anomalies = anomalyRepository.findByProjectIdAndStatus(project.getId(), AnomalyStatus.DETECTED).size();

        req.setOverdueMilestonesCount((int) overdueMilestones);
        req.setUnresolvedIssuesCount((int) openIssues);
        req.setCriticalIssuesCount((int) critIssues);
        req.setAnomaliesCount((int) anomalies);

        if (project.getLastUpdated() != null) {
            req.setDaysSinceLastUpdate(Duration.between(project.getLastUpdated(), LocalDateTime.now()).toDays());
        } else {
            req.setDaysSinceLastUpdate(0);
        }

        return req;
    }

    private MLDTOs.MLExplainResponse fallbackPrediction(MLDTOs.MLFeaturesRequest f, Project project) {
        MLDTOs.MLExplainResponse resp = new MLDTOs.MLExplainResponse();
        resp.setProjectId(f.getProjectId());

        // Composite risk calculation
        double riskScore = (1.0 - f.getSpi()) * 40.0 +
                           (1.0 - f.getCpi()) * 30.0 +
                           (f.getOverdueMilestonesCount() * 8.0) +
                           (f.getCriticalIssuesCount() * 12.0) +
                           (f.getAnomaliesCount() * 6.0);

        String level;
        double riskProb;
        if (riskScore < 8.0) {
            level = "LOW";
            riskProb = Math.max(0.08, riskScore / 30.0);
        } else if (riskScore < 24.0) {
            level = "MEDIUM";
            riskProb = 0.35 + (riskScore / 60.0);
        } else if (riskScore < 45.0) {
            level = "HIGH";
            riskProb = 0.65 + Math.min(0.20, riskScore / 100.0);
        } else {
            level = "CRITICAL";
            riskProb = 0.88 + Math.min(0.10, riskScore / 200.0);
        }

        double delayDays = Math.max(0, Math.round((1.0 - f.getSpi()) * 180 + f.getOverdueMilestonesCount() * 20 + f.getCriticalIssuesCount() * 25));
        double delayProb = f.getSpi() < 0.85 || f.getOverdueMilestonesCount() > 0 ? 0.85 : 0.20;

        resp.setRiskLevel(level);
        resp.setRiskProbability(Math.round(riskProb * 100.0) / 100.0);
        resp.setPredictedDelayDays(delayDays);
        resp.setDelayProbability(delayProb);

        List<String> factors = new ArrayList<>();
        List<Map<String, Object>> contributions = new ArrayList<>();

        if (f.getSpi() < 0.85) {
            String desc = String.format("SPI = %.2f (%.1f%% schedule lag behind baseline)", f.getSpi(), (1.0 - f.getSpi()) * 100);
            factors.add(desc);
            contributions.add(createContrib("spi", f.getSpi(), (1.0 - f.getSpi()) * 2.0, "RISK_INCREASING", desc));
        }
        if (f.getCpi() < 0.85) {
            String desc = String.format("CPI = %.2f (Cost overrun of %.1f%%)", f.getCpi(), (1.0 - f.getCpi()) * 100);
            factors.add(desc);
            contributions.add(createContrib("cpi", f.getCpi(), (1.0 - f.getCpi()) * 1.8, "RISK_INCREASING", desc));
        }
        if (f.getOverdueMilestonesCount() > 0) {
            String desc = f.getOverdueMilestonesCount() + " overdue milestone(s)";
            factors.add(desc);
            contributions.add(createContrib("overdue_milestones", f.getOverdueMilestonesCount(), f.getOverdueMilestonesCount() * 0.5, "RISK_INCREASING", desc));
        }
        if (f.getCriticalIssuesCount() > 0) {
            String desc = f.getCriticalIssuesCount() + " critical unresolved issue(s)";
            factors.add(desc);
            contributions.add(createContrib("critical_issues", f.getCriticalIssuesCount(), f.getCriticalIssuesCount() * 0.8, "RISK_INCREASING", desc));
        }
        if (f.getAnomaliesCount() > 0) {
            String desc = f.getAnomaliesCount() + " reporting anomalies detected";
            factors.add(desc);
            contributions.add(createContrib("anomalies", f.getAnomaliesCount(), f.getAnomaliesCount() * 0.4, "RISK_INCREASING", desc));
        }

        if (factors.isEmpty()) {
            factors.add("EVM parameters and progress velocities are within target tolerances");
            contributions.add(createContrib("spi", f.getSpi(), -0.5, "RISK_DECREASING", "Good Schedule Performance"));
        }

        resp.setTopContributingFactors(factors);
        resp.setFeatureContributions(contributions);

        String summary = String.format("AI Risk Engine assessed %s risk (%d%% probability) with an estimated %s day delay impact. Key drivers: %s.",
                level, (int) (riskProb * 100), (int) delayDays, String.join("; ", factors));
        resp.setAiSummary(summary);

        return resp;
    }

    private Map<String, Object> createContrib(String feature, Object value, double impact, String dir, String desc) {
        Map<String, Object> map = new HashMap<>();
        map.put("feature", feature);
        map.put("value", value);
        map.put("impact", Math.round(impact * 1000.0) / 1000.0);
        map.put("direction", dir);
        map.put("description", desc);
        return map;
    }
}
