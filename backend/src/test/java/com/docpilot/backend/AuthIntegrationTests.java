package com.docpilot.backend;

import com.docpilot.backend.dto.AuthResponse;
import com.docpilot.backend.dto.LoginRequest;
import com.docpilot.backend.dto.RegisterRequest;
import com.docpilot.backend.entity.Role;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class AuthIntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
    }

    @Test
    public void testRegisterUserSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@docpilot.com");
        request.setPassword("password123");
        request.setRole(Role.ROLE_EMPLOYEE);

        ResponseEntity<User> response = restTemplate.postForEntity(
                "/api/auth/register",
                request,
                User.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getUsername()).isEqualTo("testuser");
        assertThat(response.getBody().getEmail()).isEqualTo("test@docpilot.com");
        assertThat(response.getBody().getRole()).isEqualTo(Role.ROLE_EMPLOYEE);
        assertThat(userRepository.findByUsername("testuser")).isPresent();
    }

    @Test
    public void testLoginUserSuccess() {
        // Register user first
        RegisterRequest register = new RegisterRequest();
        register.setUsername("loginuser");
        register.setEmail("login@docpilot.com");
        register.setPassword("secret123");
        register.setRole(Role.ROLE_MANAGER);

        restTemplate.postForEntity("/api/auth/register", register, User.class);

        // Try logging in
        LoginRequest login = new LoginRequest();
        login.setUsernameOrEmail("loginuser");
        login.setPassword("secret123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login",
                login,
                AuthResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isNotEmpty();
        assertThat(response.getBody().getUsername()).isEqualTo("loginuser");
        assertThat(response.getBody().getRole()).isEqualTo(Role.ROLE_MANAGER);
    }
}
