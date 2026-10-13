package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.Priest;
import com.path.parish.repository.PriestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/priests")
@CrossOrigin(origins = "*")
public class AdminPriestController {

    private final PriestRepository priestRepository;

    public AdminPriestController(PriestRepository priestRepository) {
        this.priestRepository = priestRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Priest>>> getAllPriests() {
        return ResponseEntity.ok(ApiResponse.ok(priestRepository.findAllByOrderByDisplayOrderAsc()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Priest>> createPriest(@RequestBody Priest priest) {
        if (priest.getDisplayOrder() == null) {
            priest.setDisplayOrder(priestRepository.findAll().size());
        }
        Priest saved = priestRepository.save(priest);
        return ResponseEntity.ok(ApiResponse.ok("Priest profile saved successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Priest>> updatePriest(
            @PathVariable Long id, @RequestBody Priest details) {
        return priestRepository.findById(id).map(p -> {
            p.setFullName(details.getFullName());
            p.setTitle(details.getTitle());
            p.setBiography(details.getBiography());
            p.setPortraitImageUrl(details.getPortraitImageUrl());
            p.setServiceStart(details.getServiceStart());
            p.setServiceEnd(details.getServiceEnd());
            p.setPriestStatus(details.getPriestStatus());
            if (details.getDisplayOrder() != null) p.setDisplayOrder(details.getDisplayOrder());
            if (details.getIsPublished() != null) p.setIsPublished(details.getIsPublished());
            Priest saved = priestRepository.save(p);
            return ResponseEntity.ok(ApiResponse.ok("Priest profile updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Priest not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePriest(@PathVariable Long id) {
        return priestRepository.findById(id).map(p -> {
            priestRepository.delete(p);
            return ResponseEntity.ok(ApiResponse.ok("Priest profile deleted", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Priest not found")));
    }

    @PostMapping("/reorder")
    @Transactional
    public ResponseEntity<ApiResponse<String>> reorderPriests(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long id = Long.valueOf(item.get("id").toString());
            Integer order = Integer.valueOf(item.get("displayOrder").toString());
            priestRepository.findById(id).ifPresent(p -> {
                p.setDisplayOrder(order);
                priestRepository.save(p);
            });
        }
        return ResponseEntity.ok(ApiResponse.ok("Priests reordered successfully", "REORDERED"));
    }
}
