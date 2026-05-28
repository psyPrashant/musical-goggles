package com.psybergate.recruitment.auth;

import com.psybergate.recruitment.auth.dto.CandidateTokenRequest;
import com.psybergate.recruitment.auth.dto.CandidateTokenResponse;
import com.psybergate.recruitment.auth.dto.LoginRequest;
import com.psybergate.recruitment.auth.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);


    CandidateTokenResponse validateCandidateToken(CandidateTokenRequest request);
}
