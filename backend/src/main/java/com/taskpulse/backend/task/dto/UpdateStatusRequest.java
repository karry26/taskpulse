package com.taskpulse.backend.task.dto;

import com.taskpulse.backend.task.entity.TaskStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateStatusRequest {

    private TaskStatus status;

}