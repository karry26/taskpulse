package com.taskpulse.backend.task.controller;

import com.taskpulse.backend.task.entity.Task;
import com.taskpulse.backend.task.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}