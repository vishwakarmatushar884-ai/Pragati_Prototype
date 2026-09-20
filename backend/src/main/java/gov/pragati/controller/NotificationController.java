package gov.pragati.controller;

import gov.pragati.dto.CommonDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "User notification center and status management")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<List<CommonDTOs.NotificationDTO>> getNotifications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String email = userPrincipal != null ? userPrincipal.getUsername() : "admin@pragati.demo";
        return ResponseEntity.ok(notificationService.getUserNotifications(email));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String email = userPrincipal != null ? userPrincipal.getUsername() : "admin@pragati.demo";
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String email = userPrincipal != null ? userPrincipal.getUsername() : "admin@pragati.demo";
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }
}
