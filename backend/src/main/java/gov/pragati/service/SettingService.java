package gov.pragati.service;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.entity.AuditAction;
import gov.pragati.entity.RiskThreshold;
import gov.pragati.entity.SystemSetting;
import gov.pragati.repository.RiskThresholdRepository;
import gov.pragati.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingService {

    private final SystemSettingRepository settingRepository;
    private final RiskThresholdRepository thresholdRepository;
    private final AuditService auditService;

    public SettingService(SystemSettingRepository settingRepository,
                          RiskThresholdRepository thresholdRepository,
                          AuditService auditService) {
        this.settingRepository = settingRepository;
        this.thresholdRepository = thresholdRepository;
        this.auditService = auditService;
    }

    public CommonDTOs.SystemSettingsDTO getAllSettings() {
        CommonDTOs.SystemSettingsDTO dto = new CommonDTOs.SystemSettingsDTO();

        Map<String, String> general = new HashMap<>();
        Map<String, Integer> weights = new HashMap<>();
        Map<String, String> thresholds = new HashMap<>();

        List<SystemSetting> settings = settingRepository.findAll();
        for (SystemSetting s : settings) {
            if ("HEALTH_WEIGHTS".equalsIgnoreCase(s.getCategory())) {
                try {
                    weights.put(s.getSettingKey(), Integer.parseInt(s.getSettingValue()));
                } catch (NumberFormatException ignored) {}
            } else if ("THRESHOLDS".equalsIgnoreCase(s.getCategory())) {
                thresholds.put(s.getSettingKey(), s.getSettingValue());
            } else {
                general.put(s.getSettingKey(), s.getSettingValue());
            }
        }

        // Add default thresholds if not populated
        if (thresholds.isEmpty()) {
            thresholds.put("spi_low_risk", "0.95");
            thresholds.put("spi_medium_risk", "0.85");
            thresholds.put("spi_high_risk", "0.75");
            thresholds.put("cpi_low_risk", "0.95");
            thresholds.put("cpi_medium_risk", "0.85");
            thresholds.put("cpi_high_risk", "0.75");
        }

        if (weights.isEmpty()) {
            weights.put("weight_schedule", 30);
            weights.put("weight_cost", 25);
            weights.put("weight_milestone", 20);
            weights.put("weight_issues", 15);
            weights.put("weight_regularity", 10);
        }

        if (!general.containsKey("escalation_level1_minutes")) {
            general.put("escalation_level1_minutes", "5");
            general.put("escalation_level2_minutes", "10");
            general.put("stale_update_days", "14");
            general.put("cost_overrun_pct_threshold", "10");
        }

        dto.setGeneral(general);
        dto.setWeights(weights);
        dto.setThresholds(thresholds);
        return dto;
    }

    @Transactional
    public void updateSettings(CommonDTOs.SystemSettingsDTO dto, String updatedBy) {
        if (dto.getGeneral() != null) {
            dto.getGeneral().forEach((k, v) -> saveOrUpdateSetting(k, v, "GENERAL", "General Configuration"));
        }
        if (dto.getWeights() != null) {
            dto.getWeights().forEach((k, v) -> saveOrUpdateSetting(k, String.valueOf(v), "HEALTH_WEIGHTS", "Health Score Component Weight"));
        }
        if (dto.getThresholds() != null) {
            dto.getThresholds().forEach((k, v) -> saveOrUpdateSetting(k, v, "THRESHOLDS", "EVM & Risk Threshold"));
        }

        auditService.logAction(AuditAction.UPDATE_SETTINGS, "SystemSetting", 0L, "Platform Settings",
                null, null, "Settings updated by " + updatedBy);
    }

    private void saveOrUpdateSetting(String key, String value, String category, String desc) {
        SystemSetting s = settingRepository.findBySettingKey(key).orElse(new SystemSetting(key, value, desc, category));
        s.setSettingValue(value);
        s.setCategory(category);
        settingRepository.save(s);
    }
}
