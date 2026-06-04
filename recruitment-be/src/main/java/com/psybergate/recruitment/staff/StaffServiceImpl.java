package com.psybergate.recruitment.staff;

import com.psybergate.recruitment.domain.Role;
import com.psybergate.recruitment.domain.User;
import com.psybergate.recruitment.repository.UserRepository;
import com.psybergate.recruitment.staff.dto.StaffRequest;
import com.psybergate.recruitment.staff.dto.StaffResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<StaffResponse> findAll() {
        return userRepository.findByRoleIn(List.of(Role.ADMIN, Role.RECRUITER))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StaffResponse create(StaffRequest request) {
        validateStaffRole(request.role());
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "EMAIL_TAKEN");
        }
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return toResponse(userRepository.save(user));
    }

    @Override
    public StaffResponse update(UUID id, StaffRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Staff user not found"));
        validateStaffRole(request.role());
        userRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(__ -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "EMAIL_TAKEN"); });
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setRole(request.role());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    private void validateStaffRole(Role role) {
        if (role == Role.CANDIDATE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CANDIDATE role is not permitted for staff");
        }
    }

    private StaffResponse toResponse(User user) {
        return new StaffResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
