package com.taskpulse.backend.task.redis;

import com.taskpulse.backend.task.entity.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String PREFIX = "reminder:";
    public void saveReminder(Task task) {
        String key = PREFIX + task.getId();
        // Store userId:dueDate so the scheduler can include userId in the Kafka event
        Object value = task.getUser().getId() + ":" + task.getDueDate().toString();
        // Calculate TTL (time until due date)
        long secondsUntilDue =
                java.time.Duration
                        .between(
                                java.time.LocalDateTime.now(),
                                task.getDueDate()
                        )
                        .getSeconds();

        if (secondsUntilDue > 0) {

            redisTemplate
                    .opsForValue()
                    .set(
                            key,
                            value,
                            Duration.ofSeconds(secondsUntilDue)
                    );
        }
    }

    public Set<String> getAllReminderKeys() {
        return redisTemplate.keys("reminder:*");
    }

    public String getReminder(String key) {
        return redisTemplate.opsForValue().get(key).toString();
    }




}