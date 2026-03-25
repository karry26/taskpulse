package com.taskpulse.backend.task.repository;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository
        extends JpaRepository<Task, UUID> {
    List<Task> findByUser(User user);
    Optional<Task> findByIdAndUser(UUID id, User user);
    List<Task> findByDueDateBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}