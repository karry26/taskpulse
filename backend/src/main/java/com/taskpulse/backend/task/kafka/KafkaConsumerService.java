package com.taskpulse.backend.task.kafka;

import com.taskpulse.backend.notification.entity.Notification;
import com.taskpulse.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final NotificationRepository notificationRepository;
    @KafkaListener(
            topics = "task-reminders",
            groupId = "taskpulse-group"
    )
    public void consume(String message) {

        System.out.println(
                " Notification received: "
                        + message
        );
        Notification notification =
                Notification.builder()
                        .taskId("extract-from-message")
                        .message(message)
                        .createdAt(LocalDateTime.now())
                        .build();

        notificationRepository.save(notification);
    }
}