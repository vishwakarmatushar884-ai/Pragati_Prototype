package gov.pragati.scheduler;

import gov.pragati.service.EscalationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertEscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(AlertEscalationScheduler.class);

    private final EscalationService escalationService;

    public AlertEscalationScheduler(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    @Scheduled(cron = "${app.escalation.cron:0 */1 * * * *}")
    public void runEscalationCycle() {
        try {
            escalationService.evaluateAutomaticEscalations();
        } catch (Exception e) {
            log.error("Error during scheduled escalation evaluation: {}", e.getMessage());
        }
    }
}
