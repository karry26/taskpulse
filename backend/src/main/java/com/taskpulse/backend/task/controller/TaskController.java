package com.taskpulse.backend.task.controller;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService service;

    @PostMapping
    public Task create(@RequestBody Task task) {
        return service.create(task);
    }

    @GetMapping
    public List<Task> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public Task update(
            @PathVariable UUID id,
            @RequestBody Task task) {

        return service.update(id, task);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable UUID id) {

        service.delete(id);
    }
}