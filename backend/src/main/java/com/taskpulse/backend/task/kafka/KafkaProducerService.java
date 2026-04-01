package com.taskpulse.backend.task.kafka;

import lombok.RequiredArgsConstructor;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, TaskReminderEvent> kafkaTemplate;

    private static final String TOPIC = "task-reminders";

    public void sendReminder(
            String taskId,
            String userId,
            String message
    ) {
        TaskReminderEvent event = new TaskReminderEvent();
        event.setTaskId(UUID.fromString(taskId));
        event.setUserId(UUID.fromString(userId));
        event.setMessage(message);

        kafkaTemplate.send(
                TOPIC,
                taskId,
                event
        );

        System.out.println(
                "Kafka message sent for task: "
                        + taskId
                        + ", userId: "
                        + userId
        );
    }
}