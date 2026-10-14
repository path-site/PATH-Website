package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.Announcement;
import com.path.parish.repository.AnnouncementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/announcements")
@CrossOrigin(origins = "*")
public class AdminAnnouncementController {

    private final AnnouncementRepository announcementRepository;

    public AdminAnnouncementController(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok(announcementRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Announcement>> getAnnouncementById(@PathVariable Long id) {
        return announcementRepository.findById(id)
                .map(a -> ResponseEntity.ok(ApiResponse.ok(a)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(@RequestBody Announcement announcement) {
        if (announcement.getSlug() == null || announcement.getSlug().isBlank()) {
            announcement.setSlug(generateRandomSlug());
        }
        while (announcementRepository.existsBySlug(announcement.getSlug())) {
            announcement.setSlug(generateRandomSlug());
        }
        if (announcement.getAuthorName() == null || announcement.getAuthorName().isBlank()) {
            announcement.setAuthorName(SecurityContextHolder.getContext().getAuthentication().getName());
        }
        if ("PUBLISHED".equalsIgnoreCase(announcement.getStatus()) && announcement.getPublishedAt() == null) {
            announcement.setPublishedAt(LocalDateTime.now());
        }
        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(ApiResponse.ok("Announcement created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(
            @PathVariable Long id, @RequestBody Announcement details) {
        return announcementRepository.findById(id).map(a -> {
            a.setTitle(details.getTitle());
            a.setSlug(details.getSlug());
            a.setSummary(details.getSummary());
            a.setContent(details.getContent());
            a.setCategory(details.getCategory());
            a.setFeaturedImageUrl(details.getFeaturedImageUrl());
            if (details.getStatus() != null) {
                if ("PUBLISHED".equalsIgnoreCase(details.getStatus()) && a.getPublishedAt() == null) {
                    a.setPublishedAt(LocalDateTime.now());
                }
                a.setStatus(details.getStatus());
            }
            Announcement saved = announcementRepository.save(a);
            return ResponseEntity.ok(ApiResponse.ok("Announcement updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    @PostMapping("/publish-batch")
    public ResponseEntity<ApiResponse<List<Announcement>>> publishBatchAnnouncements(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No announcement IDs provided"));
        }
        List<Announcement> announcements = announcementRepository.findAllById(ids);
        LocalDateTime now = LocalDateTime.now();
        for (Announcement a : announcements) {
            a.setStatus("PUBLISHED");
            if (a.getPublishedAt() == null) {
                a.setPublishedAt(now);
            }
        }
        List<Announcement> saved = announcementRepository.saveAll(announcements);
        return ResponseEntity.ok(ApiResponse.ok("Batch published " + saved.size() + " announcements successfully", saved));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Announcement>> publishAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id).map(a -> {
            a.setStatus("PUBLISHED");
            a.setPublishedAt(LocalDateTime.now());
            Announcement saved = announcementRepository.save(a);
            return ResponseEntity.ok(ApiResponse.ok("Announcement published successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<Announcement>> unpublishAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id).map(a -> {
            a.setStatus("DRAFT");
            Announcement saved = announcementRepository.save(a);
            return ResponseEntity.ok(ApiResponse.ok("Announcement reverted to draft", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<Announcement>> archiveAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id).map(a -> {
            a.setStatus("ARCHIVED");
            Announcement saved = announcementRepository.save(a);
            return ResponseEntity.ok(ApiResponse.ok("Announcement archived", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAnnouncement(@PathVariable Long id) {
        return announcementRepository.findById(id).map(a -> {
            announcementRepository.delete(a);
            return ResponseEntity.ok(ApiResponse.ok("Announcement deleted successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Announcement not found")));
    }

    private String generateRandomSlug() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}
