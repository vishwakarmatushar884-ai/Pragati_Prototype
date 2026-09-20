package gov.pragati.repository;

import gov.pragati.entity.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> {
    List<RiskPrediction> findByProjectIdOrderByGeneratedAtDesc(Long projectId);
    Optional<RiskPrediction> findFirstByProjectIdOrderByGeneratedAtDesc(Long projectId);
}
