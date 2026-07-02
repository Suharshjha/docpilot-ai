package com.docpilot.backend.service;

import com.docpilot.backend.dto.AuthResponse;
import com.docpilot.backend.dto.LoginRequest;
import com.docpilot.backend.dto.RegisterRequest;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.exception.UserAlreadyExistsException;
import com.docpilot.backend.repository.UserRepository;
import com.docpilot.backend.security.JwtTokenProvider;
import com.docpilot.backend.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditService auditService;

    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email Address already in use!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .build();

        User savedUser = userRepository.save(user);
        auditService.log("REGISTER", savedUser.getUsername(), "Registered new user with role: " + savedUser.getRole());
        return savedUser;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        auditService.log("LOGIN", userPrincipal.getUsername(), "User logged in successfully");

        return AuthResponse.builder()
                .token(jwt)
                .id(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .role(userPrincipal.getRole())
                .build();
    }

    public void logoutUser(String username) {
        auditService.log("LOGOUT", username, "User logged out successfully");
    }
}
