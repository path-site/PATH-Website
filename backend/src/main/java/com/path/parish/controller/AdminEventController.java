package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.ParishEvent;
import com.path.parish.repository.ParishEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@CrossOrigin(origins = "*")
public class AdminEventController {

    private final ParishEventRepository parishEventRepository;

    public AdminEventController(ParishEventRepository parishEventRepository) {
        this.parishEventRepository = parishEventRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParishEvent>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.ok(parishEventRepository.findAllByOrderByStartDatetimeAsc()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParishEvent>> getEventById(@PathVariable Long id) {
        return parishEventRepository.findById(id)
                .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Event not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ParishEvent>> createEvent(@RequestBody ParishEvent event) {
        if (event.getSlug() == null || event.getSlug().isBlank()) {
            event.setSlug(generateSlug(event.getTitle()));
        }
        if (parishEventRepository.existsBySlug(event.getSlug())) {
            event.setSlug(event.getSlug() + "-" + System.currentTimeMillis() % 10000);
        }
        ParishEvent saved = parishEventRepository.save(event);
        return ResponseEntity.ok(ApiResponse.ok("Event created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParishEvent>> updateEvent(
            @PathVariable Long id, @RequestBody ParishEvent details) {
        return parishEventRepository.findById(id).map(e -> {
            e.setTitle(details.getTitle());
            e.setSlug(details.getSlug());
            e.setDescription(details.getDescription());
            e.setEventImageUrl(details.getEventImageUrl());
            e.setStartDatetime(details.getStartDatetime());
            e.setEndDatetime(details.getEndDatetime());
            e.setVenue(details.getVenue());
            e.setCategory(details.getCategory());
            e.setExternalUrl(details.getExternalUrl());
            if (details.getStatus() != null) e.setStatus(details.getStatus());
            ParishEvent saved = parishEventRepository.save(e);
            return ResponseEntity.ok(ApiResponse.ok("Event updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Event not found")));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<ParishEvent>> publishEvent(@PathVariable Long id) {
        return parishEventRepository.findById(id).map(e -> {
            e.setStatus("PUBLISHED");
            ParishEvent saved = parishEventRepository.save(e);
            return ResponseEntity.ok(ApiResponse.ok("Event published successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Event not found")));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<ParishEvent>> unpublishEvent(@PathVariable Long id) {
        return parishEventRepository.findById(id).map(e -> {
            e.setStatus("DRAFT");
            ParishEvent saved = parishEventRepository.save(e);
            return ResponseEntity.ok(ApiResponse.ok("Event reverted to draft", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Event not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEvent(@PathVariable Long id) {
        return parishEventRepository.findById(id).map(e -> {
            parishEventRepository.delete(e);
            return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Event not found")));
    }

    private String generateSlug(String title) {
        if (title == null) return "event-" + System.currentTimeMillis();
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
