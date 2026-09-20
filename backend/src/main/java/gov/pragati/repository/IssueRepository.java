package gov.pragati.repository;

import gov.pragati.entity.Issue;
import gov.pragati.entity.IssuePriority;
import gov.pragati.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProjectId(Long projectId);
    List<Issue> findByStatusNot(IssueStatus status);
    List<Issue> findByProjectIdAndStatusNot(Long projectId, IssueStatus status);
    List<Issue> findByPriorityAndStatusNot(IssuePriority priority, IssueStatus status);
    List<Issue> findByProjectIdAndPriorityAndStatusNot(Long projectId, IssuePriority priority, IssueStatus status);
    long countByStatusNot(IssueStatus status);
    long countByPriorityAndStatusNot(IssuePriority priority, IssueStatus status);
}
