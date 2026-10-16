package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.dto.LoginRequest;
import com.path.parish.dto.LoginResponse;
import com.path.parish.dto.ChangePasswordRequest;
import com.path.parish.model.AdminUser;
import com.path.parish.repository.AdminUserRepository;
import com.path.parish.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthController(
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider,
            AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            AdminUser admin = adminUserRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String token = tokenProvider.generateToken(admin.getEmail(), admin.getRole());

            LoginResponse response = new LoginResponse(
                    token,
                    admin.getId(),
                    admin.getFullName(),
                    admin.getEmail(),
                    admin.getRole()
            );

            return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminUser>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }

        AdminUser user = adminUserRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Don't leak hash
        user.setPasswordHash(null);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }

        AdminUser user = adminUserRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Current password does not match."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New password must be at least 6 characters."));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
        adminUserRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }
}
