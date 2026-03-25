package com.taskpulse.backend.task.scheduler;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.kafka.KafkaProducerService;
import com.taskpulse.backend.task.redis.RedisService;
import com.taskpulse.backend.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {
    private final RedisService redisService;
    private final KafkaProducerService kafkaProducerService;
    @Scheduled(fixedRate = 60000) // every 1 minute
    public void check() {

        // Step 1 — current time
        LocalDateTime now =
                LocalDateTime.now();

        // Step 2 — next 5 minutes
        LocalDateTime nextFiveMinutes =
                now.plusMinutes(5);

        Set<String> reminderKeys =
                redisService.getAllReminderKeys();

        for (String key : reminderKeys) {

            String dueDateStr =
                    redisService.getReminder(key);

            if (dueDateStr == null) {
                continue;
            }

            // Convert String → LocalDateTime
            LocalDateTime dueDate =
                    LocalDateTime.parse(dueDateStr);

            // Check if due soon
            if (dueDate.isAfter(now)
                    && dueDate.isBefore(nextFiveMinutes)) {

                String taskId =
                        key.replace("reminder:", "");

                String message =
                        "Reminder: Task " +
                                taskId +
                                " due at " +
                                dueDate;

                kafkaProducerService.sendReminder(taskId, message);
            }
        }


    }

}
