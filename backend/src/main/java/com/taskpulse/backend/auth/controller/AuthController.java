package com.taskpulse.backend.auth.controller;

import com.taskpulse.backend.auth.dto.LoginRequest;
import com.taskpulse.backend.auth.jwt.JwtUtil;
import com.taskpulse.backend.user.entity.User;
import com.taskpulse.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Invalid password"
            );
        }

        return jwtUtil.generateToken(
                user.getEmail()
        );
    }
}