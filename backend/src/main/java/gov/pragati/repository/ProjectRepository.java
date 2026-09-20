package gov.pragati.repository;

import gov.pragati.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String projectCode);
    List<Project> findByMinistry(String ministry);
    List<Project> findByState(String state);
    List<Project> findByRiskLevel(String riskLevel);
    List<Project> findByCurrentStatus(String currentStatus);
    List<Project> findByManagerId(Long managerId);
    List<Project> findByFieldOfficerId(Long fieldOfficerId);

    @Query("SELECT p FROM Project p WHERE " +
           "(:ministry IS NULL OR LOWER(p.ministry) = LOWER(:ministry)) AND " +
           "(:state IS NULL OR LOWER(p.state) = LOWER(:state)) AND " +
           "(:sector IS NULL OR LOWER(p.sector) = LOWER(:sector)) AND " +
           "(:riskLevel IS NULL OR LOWER(p.riskLevel) = LOWER(:riskLevel)) AND " +
           "(:status IS NULL OR LOWER(p.currentStatus) = LOWER(:status)) AND " +
           "(:query IS NULL OR (" +
           "  LOWER(p.projectName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.ministry) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.state) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.district) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "  LOWER(p.scheme) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    List<Project> findWithFilters(
            @Param("ministry") String ministry,
            @Param("state") String state,
            @Param("sector") String sector,
            @Param("riskLevel") String riskLevel,
            @Param("status") String status,
            @Param("query") String query
    );
}
