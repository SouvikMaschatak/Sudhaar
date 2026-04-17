package com.login.jwtoken.login_api.repository;

import com.login.jwtoken.login_api.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // get all notifications for a resident, newest first
    List<Notification> findByResidentPhoneOrderByCreatedAtDesc(String residentPhone);
}