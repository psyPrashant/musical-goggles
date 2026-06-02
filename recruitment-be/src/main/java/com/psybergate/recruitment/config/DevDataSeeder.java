package com.psybergate.recruitment.config;

import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        User admin = userRepository.findByEmail("admin@recruitment.dev").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@recruitment.dev");
            u.setRole(Role.ADMIN);
            return u;
        });
        if (admin.getPasswordHash() == null) {
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            userRepository.save(admin);
        }
    }
}
