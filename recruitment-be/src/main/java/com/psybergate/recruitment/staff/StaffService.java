package com.psybergate.recruitment.staff;

import com.psybergate.recruitment.staff.dto.StaffRequest;
import com.psybergate.recruitment.staff.dto.StaffResponse;

import java.util.List;
import java.util.UUID;

public interface StaffService {
    List<StaffResponse> findAll();
    StaffResponse create(StaffRequest request);
    StaffResponse update(UUID id, StaffRequest request);
}
