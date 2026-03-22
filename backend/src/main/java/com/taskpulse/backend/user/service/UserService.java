package com.taskpulse.backend.user.service;

import com.taskpulse.backend.user.entity.User;
import com.taskpulse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public User register(User user) {

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        user.setCreatedAt(LocalDateTime.now());

        return repository.save(user);
    }
}