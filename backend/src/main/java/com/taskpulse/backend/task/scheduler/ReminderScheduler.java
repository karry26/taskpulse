package com.taskpulse.backend.task.scheduler;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.kafka.KafkaProducerService;
import com.taskpulse.backend.task.redis.RedisService;
import com.taskpulse.backend.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {
    private final RedisService redisService;
    private final KafkaProducerService kafkaProducerService;
    private final TaskRepository taskRepository;

    private static final DateTimeFormatter READABLE_FORMAT =
            DateTimeFormatter.ofPattern("MMM d, yyyy 'at' h:mm a");
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

            String value =
                    redisService.getReminder(key);

            if (value == null) {
                continue;
            }

            // Value format: "{userId}:{dueDate}"
            int separatorIndex = value.indexOf(':');
            String userId = value.substring(0, separatorIndex);
            String dueDateStr = value.substring(separatorIndex + 1);

            // Convert String → LocalDateTime
            LocalDateTime dueDate =
                    LocalDateTime.parse(dueDateStr);

            // Check if due soon
            if (dueDate.isAfter(now)
                    && dueDate.isBefore(nextFiveMinutes)) {

                String taskId =
                        key.replace("reminder:", "");

                String taskTitle = taskRepository
                        .findById(UUID.fromString(taskId))
                        .map(Task::getTitle)
                        .orElse("Unknown Task");

                String message =
                        "Reminder: \"" +
                                taskTitle +
                                "\" is due on " +
                                dueDate.format(READABLE_FORMAT);

                kafkaProducerService.sendReminder(taskId, userId, message);
            }
        }


    }

}
