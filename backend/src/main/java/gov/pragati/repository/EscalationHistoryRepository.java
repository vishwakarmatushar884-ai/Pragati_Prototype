package gov.pragati.repository;

import gov.pragati.entity.EscalationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationHistoryRepository extends JpaRepository<EscalationHistory, Long> {
    List<EscalationHistory> findByAlertIdOrderByEscalatedAtDesc(Long alertId);
}
