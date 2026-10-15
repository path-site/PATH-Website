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
        List<Priest> list = new java.util.ArrayList<>(priestRepository.findAllByOrderByDisplayOrderAsc());
        sortPriests(list);
        return ResponseEntity.ok(ApiResponse.ok(list));
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
            if (details.getIsDeceased() != null) p.setIsDeceased(details.getIsDeceased());
            if (details.getDateOfDeath() != null) p.setDateOfDeath(details.getDateOfDeath());
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

    private void sortPriests(List<Priest> list) {
        list.sort((a, b) -> {
            boolean aCurrent = "CURRENT".equalsIgnoreCase(a.getPriestStatus());
            boolean bCurrent = "CURRENT".equalsIgnoreCase(b.getPriestStatus());
            if (aCurrent != bCurrent) {
                return aCurrent ? -1 : 1; // CURRENT on top
            }
            int aEnd = aCurrent ? (parseYear(a.getServiceEnd()) > 0 ? parseYear(a.getServiceEnd()) : 9999) : parseYear(a.getServiceEnd());
            int bEnd = bCurrent ? (parseYear(b.getServiceEnd()) > 0 ? parseYear(b.getServiceEnd()) : 9999) : parseYear(b.getServiceEnd());
            if (aEnd != bEnd) return Integer.compare(bEnd, aEnd); // Year descending

            // Within the year range, Team Moderator is unconditionally first
            int aRole = getRoleRank(a.getTitle());
            int bRole = getRoleRank(b.getTitle());
            if (aRole != bRole) return Integer.compare(aRole, bRole);

            int aStart = parseYear(a.getServiceStart());
            int bStart = parseYear(b.getServiceStart());
            if (aStart != bStart) return Integer.compare(bStart, aStart); // Year descending

            int aOrder = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
            int bOrder = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
            return Integer.compare(aOrder, bOrder);
        });
    }

    private int getRoleRank(String title) {
        if (title == null) return 4;
        String t = title.toLowerCase();
        if (t.contains("moderator")) return 1;
        if (t.contains("parish priest")) return 2;
        if (t.contains("vicar")) return 3;
        return 4;
    }

    private int parseYear(String val) {
        if (val == null) return 0;
        if ("present".equalsIgnoreCase(val.trim())) return 9999;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\d{4}").matcher(val);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group());
            } catch (Exception ignored) {}
        }
        return 0;
    }
}
