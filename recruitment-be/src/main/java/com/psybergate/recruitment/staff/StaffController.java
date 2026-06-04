package com.psybergate.recruitment.staff;

import com.psybergate.recruitment.staff.dto.StaffRequest;
import com.psybergate.recruitment.staff.dto.StaffResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponse>> list() {
        return ResponseEntity.ok(staffService.findAll());
    }

    @PostMapping
    public ResponseEntity<StaffResponse> create(@RequestBody @Valid StaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> update(@PathVariable UUID id,
                                                @RequestBody @Valid StaffRequest request) {
        return ResponseEntity.ok(staffService.update(id, request));
    }
}
