package gov.pragati.repository;

import gov.pragati.entity.Anomaly;
import gov.pragati.entity.AnomalyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, Long> {
    List<Anomaly> findByProjectId(Long projectId);
    List<Anomaly> findByProjectIdAndStatus(Long projectId, AnomalyStatus status);
    List<Anomaly> findByStatus(AnomalyStatus status);
    long countByStatus(AnomalyStatus status);
}
