package com.taskpulse.backend.notification.service;

import com.taskpulse.backend.notification.entity.Notification;
import com.taskpulse.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }
}
