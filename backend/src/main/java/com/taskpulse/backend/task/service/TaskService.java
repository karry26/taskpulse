package com.taskpulse.backend.task.service;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository repository;

    public Task create(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus("PENDING");

        return repository.save(task);
    }

    public List<Task> getAll() {
        return repository.findAll();
    }
}