package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.ContactMessage;
import com.path.parish.repository.ContactMessageRepository;
import com.path.parish.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-messages")
@CrossOrigin(origins = "*")
public class AdminContactMessageController {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    public AdminContactMessageController(ContactMessageRepository contactMessageRepository,
                                         EmailService emailService) {
        this.contactMessageRepository = contactMessageRepository;
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactMessage>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(contactMessageRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<ContactMessage>> markAsRead(@PathVariable Long id) {
        return contactMessageRepository.findById(id)
                .map(msg -> {
                    msg.setIsRead(true);
                    return ResponseEntity.ok(ApiResponse.ok(contactMessageRepository.save(msg)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resend")
    public ResponseEntity<ApiResponse<String>> resendEmail(@PathVariable Long id) {
        return contactMessageRepository.findById(id)
                .map(msg -> {
                    boolean success = emailService.sendContactInquiry(msg);
                    if (success) {
                        return ResponseEntity.ok(ApiResponse.ok("Email forwarded successfully to parish office email.", "SENT"));
                    } else {
                        return ResponseEntity.ok(ApiResponse.ok("Resend attempted, but email delivery could not complete. Check server logs.", "FAILED"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id) {
        if (!contactMessageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        contactMessageRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Message deleted successfully.", null));
    }
}
