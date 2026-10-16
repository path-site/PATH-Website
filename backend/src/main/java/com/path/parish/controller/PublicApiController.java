package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.*;
import com.path.parish.repository.MediaFileRepository;
import com.path.parish.service.PublicContentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.path.parish.repository.ContactMessageRepository;
import com.path.parish.service.EmailService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicApiController {

    private final PublicContentService publicContentService;
    private final MediaFileRepository mediaFileRepository;
    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    public PublicApiController(PublicContentService publicContentService,
                               MediaFileRepository mediaFileRepository,
                               ContactMessageRepository contactMessageRepository,
                               EmailService emailService) {
        this.publicContentService = publicContentService;
        this.mediaFileRepository = mediaFileRepository;
        this.contactMessageRepository = contactMessageRepository;
        this.emailService = emailService;
    }

    @GetMapping("/navigation")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNavigation() {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getNavigationTree()));
    }

    @GetMapping("/pages/{slug}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPage(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(publicContentService.getPageWithSections(slug)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncements(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getAnnouncements(category, search)));
    }

    @GetMapping("/announcements/{slug}")
    public ResponseEntity<ApiResponse<Announcement>> getAnnouncementBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(publicContentService.getAnnouncementBySlug(slug)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEvents() {
        Map<String, Object> data = Map.of(
                "upcoming", publicContentService.getUpcomingEvents(),
                "past", publicContentService.getPastEvents()
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/events/{slug}")
    public ResponseEntity<ApiResponse<ParishEvent>> getEventBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(publicContentService.getEventBySlug(slug)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/priests")
    public ResponseEntity<ApiResponse<List<Priest>>> getPriests() {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getPriests()));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<HistoryMilestone>>> getHistory() {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getHistoryMilestones()));
    }

    @GetMapping("/gallery")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGallery() {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getGalleryAlbums()));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(publicContentService.getAllSettings()));
    }

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<String>> submitContact(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String subject = payload.get("subject");
        String message = payload.get("message");

        if (name == null || email == null || message == null ||
                name.isBlank() || email.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please fill in all required fields."));
        }

        ContactMessage contactMessage = new ContactMessage(
                name.trim(),
                email.trim(),
                subject != null ? subject.trim() : "",
                message.trim()
        );

        contactMessage = contactMessageRepository.save(contactMessage);

        try {
            emailService.sendContactInquiry(contactMessage);
        } catch (Exception e) {
            // Logged in emailService, don't fail client request
        }

        return ResponseEntity.ok(ApiResponse.ok("Thank you! Your message has been sent to the parish office.", "SENT"));
    }

    @GetMapping("/media/{id}")
    public ResponseEntity<byte[]> getMediaFile(@PathVariable Long id) {
        return mediaFileRepository.findById(id)
                .filter(mf -> mf.getFileData() != null && mf.getFileData().length > 0)
                .map(mf -> {
                    MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
                    if (mf.getMimeType() != null) {
                        try {
                            mediaType = MediaType.parseMediaType(mf.getMimeType());
                        } catch (Exception ignored) {}
                    }
                    return ResponseEntity.ok()
                            .contentType(mediaType)
                            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=604800, immutable")
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + mf.getFileName() + "\"")
                            .body(mf.getFileData());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
