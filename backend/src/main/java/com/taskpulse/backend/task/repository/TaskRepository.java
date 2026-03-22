package com.taskpulse.backend.task.repository;

import com.taskpulse.backend.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TaskRepository
        extends JpaRepository<Task, UUID> {
}