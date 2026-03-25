package com.taskpulse.backend.task.kafka;

import lombok.RequiredArgsConstructor;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String TOPIC = "task-reminders";

    public void sendReminder(
            String taskId,
            String message
    ) {

        kafkaTemplate.send(
                TOPIC,
                taskId,
                message
        );

        System.out.println(
                "Kafka message sent for task: "
                        + taskId
        );
    }
}