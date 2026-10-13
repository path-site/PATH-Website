package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.HistoryMilestone;
import com.path.parish.repository.HistoryMilestoneRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/history")
@CrossOrigin(origins = "*")
public class AdminHistoryController {

    private final HistoryMilestoneRepository historyMilestoneRepository;

    public AdminHistoryController(HistoryMilestoneRepository historyMilestoneRepository) {
        this.historyMilestoneRepository = historyMilestoneRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HistoryMilestone>>> getAllMilestones() {
        return ResponseEntity.ok(ApiResponse.ok(historyMilestoneRepository.findAllByOrderByDisplayOrderAsc()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HistoryMilestone>> createMilestone(@RequestBody HistoryMilestone milestone) {
        if (milestone.getDisplayOrder() == null) {
            milestone.setDisplayOrder(historyMilestoneRepository.findAll().size());
        }
        HistoryMilestone saved = historyMilestoneRepository.save(milestone);
        return ResponseEntity.ok(ApiResponse.ok("History milestone saved successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HistoryMilestone>> updateMilestone(
            @PathVariable Long id, @RequestBody HistoryMilestone details) {
        return historyMilestoneRepository.findById(id).map(m -> {
            m.setTitle(details.getTitle());
            m.setEventDate(details.getEventDate());
            m.setDescription(details.getDescription());
            m.setImageUrl(details.getImageUrl());
            if (details.getDisplayOrder() != null) m.setDisplayOrder(details.getDisplayOrder());
            if (details.getIsPublished() != null) m.setIsPublished(details.getIsPublished());
            HistoryMilestone saved = historyMilestoneRepository.save(m);
            return ResponseEntity.ok(ApiResponse.ok("History milestone updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Milestone not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMilestone(@PathVariable Long id) {
        return historyMilestoneRepository.findById(id).map(m -> {
            historyMilestoneRepository.delete(m);
            return ResponseEntity.ok(ApiResponse.ok("History milestone deleted", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Milestone not found")));
    }

    @PostMapping("/reorder")
    @Transactional
    public ResponseEntity<ApiResponse<String>> reorderMilestones(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long id = Long.valueOf(item.get("id").toString());
            Integer order = Integer.valueOf(item.get("displayOrder").toString());
            historyMilestoneRepository.findById(id).ifPresent(m -> {
                m.setDisplayOrder(order);
                historyMilestoneRepository.save(m);
            });
        }
        return ResponseEntity.ok(ApiResponse.ok("History milestones reordered successfully", "REORDERED"));
    }
}
