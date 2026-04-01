package com.taskpulse.backend.task.kafka;

import com.taskpulse.backend.notification.entity.Notification;
import com.taskpulse.backend.notification.repository.NotificationRepository;
import com.taskpulse.backend.user.entity.User;
import com.taskpulse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    @KafkaListener(
            topics = "task-reminders",
            groupId = "taskpulse-group"
    )
    public void consume(TaskReminderEvent event) {

        User user = userRepository
                .findById(event.getUserId())
                .orElseThrow();
        String message = event.getMessage();
        System.out.println(
                " Notification received: "
                        + message
        );
        Notification notification =
                Notification.builder()
                        .taskId(event.getTaskId().toString())
                        .message(message)
                        .user(user)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        notificationRepository.save(notification);
    }
}