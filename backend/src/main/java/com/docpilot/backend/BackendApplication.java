package com.docpilot.backend;

import com.docpilot.backend.entity.Role;
import com.docpilot.backend.entity.User;
import com.docpilot.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner bootstrapAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                // Seed default users
                User admin = User.builder()
                        .username("admin")
                        .email("admin@docpilot.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ROLE_ADMIN)
                        .build();
                userRepository.save(admin);
                
                User manager = User.builder()
                        .username("manager")
                        .email("manager@docpilot.com")
                        .password(passwordEncoder.encode("manager123"))
                        .role(Role.ROLE_MANAGER)
                        .build();
                userRepository.save(manager);
                
                User employee = User.builder()
                        .username("employee")
                        .email("employee@docpilot.com")
                        .password(passwordEncoder.encode("employee123"))
                        .role(Role.ROLE_EMPLOYEE)
                        .build();
                userRepository.save(employee);
                
                System.out.println(">>> System seeded with default users:");
                System.out.println(">>> Admin: admin / admin123");
                System.out.println(">>> Manager: manager / manager123");
                System.out.println(">>> Employee: employee / employee123");
            }
        };
    }
}
