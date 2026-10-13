package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.AdminUser;
import com.path.parish.repository.AdminUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUser>>> getAllUsers() {
        List<AdminUser> users = adminUserRepository.findAll();
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUser>> createUser(@RequestBody AdminUser user) {
        if (adminUserRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 6 characters."));
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        AdminUser saved = adminUserRepository.save(user);
        saved.setPasswordHash(null);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUser>> updateUser(@PathVariable Long id, @RequestBody AdminUser details) {
        return adminUserRepository.findById(id).map(user -> {
            user.setFullName(details.getFullName());
            if (details.getRole() != null) user.setRole(details.getRole());
            if (details.getStatus() != null) user.setStatus(details.getStatus());
            if (details.getPasswordHash() != null && !details.getPasswordHash().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(details.getPasswordHash()));
            }
            AdminUser saved = adminUserRepository.save(user);
            saved.setPasswordHash(null);
            return ResponseEntity.ok(ApiResponse.ok("User updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("User not found")));
    }
}
