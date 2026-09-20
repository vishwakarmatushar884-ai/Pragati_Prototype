package gov.pragati.repository;

import gov.pragati.entity.Milestone;
import gov.pragati.entity.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectId(Long projectId);
    List<Milestone> findByProjectIdAndOverdueTrue(Long projectId);
    List<Milestone> findByStatus(MilestoneStatus status);
}
