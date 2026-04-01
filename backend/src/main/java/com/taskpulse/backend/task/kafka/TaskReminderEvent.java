package com.taskpulse.backend.task.kafka;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class TaskReminderEvent {

    private UUID taskId;
    private UUID userId;
    private String message;
}
