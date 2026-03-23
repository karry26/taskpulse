package com.taskpulse.backend.task.service;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.repository.TaskRepository;
import com.taskpulse.backend.user.entity.User;
import com.taskpulse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository repository;
    private final UserRepository userRepository;
    public Task create(Task task) {
        // Step 1 — Get authentication
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Step 2 — Extract email
        String email =
                (String) authentication.getPrincipal();

        // Step 3 — Find user from DB
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        // Step 4 — Attach user to task
        task.setUser(user);
        task.setCreatedAt(LocalDateTime.now());
        task.setStatus("PENDING");

        return repository.save(task);
    }

    public List<Task> getAll() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // Step 2 — Extract email
        String email =
                (String) authentication.getPrincipal();

        // Step 3 — Find user from DB
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));
        return repository.findByUser(user);

    }
    public Task update(UUID id, Task updatedTask) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                (String) authentication.getPrincipal();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        Task existingTask =
                repository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException("Task not found"));

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setStatus(updatedTask.getStatus());

        return repository.save(existingTask);
    }
    public void delete(UUID id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                (String) authentication.getPrincipal();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        Task task =
                repository
                        .findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new RuntimeException("Task not found"));

        repository.delete(task);
    }
}