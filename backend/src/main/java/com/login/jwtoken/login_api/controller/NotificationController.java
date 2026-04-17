package com.login.jwtoken.login_api.controller;

import com.login.jwtoken.login_api.model.Notification;
import com.login.jwtoken.login_api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // ── GET all notifications for a resident ──────────────
    // Protected — requires valid JWT token
    @GetMapping("/resident/{phone}")
    public ResponseEntity<List<Notification>> getByResident(
            @PathVariable String phone) {
        List<Notification> notifications =
            notificationRepository.findByResidentPhoneOrderByCreatedAtDesc(phone);
        return ResponseEntity.ok(notifications);
    }

    // ── PUT mark a notification as read ───────────────────
    @PutMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Notification not found.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read."));
    }
}