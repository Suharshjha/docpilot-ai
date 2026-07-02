package com.docpilot.backend.service;

import com.docpilot.backend.dto.UserDto;
import com.docpilot.backend.dto.UserUpdateRequest;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.exception.ResourceNotFoundException;
import com.docpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public Page<UserDto> getUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(query, pageable);
        return users.map(this::convertToDto);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateRequest updateRequest, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String oldRole = user.getRole().name();
        user.setEmail(updateRequest.getEmail());
        user.setRole(updateRequest.getRole());

        if (StringUtils.hasText(updateRequest.getPassword())) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        auditService.log("USER_UPDATE", adminUsername, 
                String.format("Updated user %s: Role %s -> %s", user.getUsername(), oldRole, updatedUser.getRole().name()));

        return convertToDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        userRepository.delete(user);
        auditService.log("USER_DELETE", adminUsername, "Deleted user: " + user.getUsername());
    }

    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
