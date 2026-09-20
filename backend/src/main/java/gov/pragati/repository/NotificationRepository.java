package gov.pragati.repository;

import gov.pragati.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserOrderByCreatedAtDesc(String recipientUser);
    List<Notification> findByRecipientUserAndIsReadFalseOrderByCreatedAtDesc(String recipientUser);
    long countByRecipientUserAndIsReadFalse(String recipientUser);
}
