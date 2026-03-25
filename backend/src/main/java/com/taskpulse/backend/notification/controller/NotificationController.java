package com.taskpulse.backend.notification.controller;

import com.taskpulse.backend.notification.entity.Notification;
import com.taskpulse.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService service;

    @GetMapping
    public List<Notification> getAll() {
        return service.getAll();
    }
}
