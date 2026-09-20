package gov.pragati.service;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.entity.Notification;
import gov.pragati.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void sendNotification(String recipient, String title, String message, String type, Long projectId, String severity) {
        Notification notif = new Notification(recipient, title, message, type, projectId, severity);
        notificationRepository.save(notif);
    }

    public List<CommonDTOs.NotificationDTO> getUserNotifications(String userEmail) {
        List<Notification> list = notificationRepository.findByRecipientUserOrderByCreatedAtDesc(userEmail);
        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByRecipientUserAndIsReadFalse(userEmail);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String userEmail) {
        List<Notification> list = notificationRepository.findByRecipientUserAndIsReadFalseOrderByCreatedAtDesc(userEmail);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    private CommonDTOs.NotificationDTO toDTO(Notification n) {
        CommonDTOs.NotificationDTO dto = new CommonDTOs.NotificationDTO();
        dto.setId(n.getId());
        dto.setRecipientUser(n.getRecipientUser());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRelatedProjectId(n.getRelatedProjectId());
        dto.setRelatedEntityId(n.getRelatedEntityId());
        dto.setSeverity(n.getSeverity());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
