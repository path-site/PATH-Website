package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.NavigationItem;
import com.path.parish.repository.NavigationItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/navigation")
@CrossOrigin(origins = "*")
public class AdminNavigationController {

    private final NavigationItemRepository navigationItemRepository;

    public AdminNavigationController(NavigationItemRepository navigationItemRepository) {
        this.navigationItemRepository = navigationItemRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NavigationItem>>> getAllItems() {
        return ResponseEntity.ok(ApiResponse.ok(navigationItemRepository.findAllByOrderByDisplayOrderAsc()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NavigationItem>> createItem(@RequestBody NavigationItem item) {
        if (item.getDisplayOrder() == null) {
            item.setDisplayOrder(navigationItemRepository.findAll().size());
        }
        NavigationItem saved = navigationItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.ok("Menu item created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NavigationItem>> updateItem(@PathVariable Long id, @RequestBody NavigationItem details) {
        return navigationItemRepository.findById(id).map(item -> {
            item.setLabel(details.getLabel());
            item.setDestinationType(details.getDestinationType());
            item.setTargetPath(details.getTargetPath());
            item.setExternalUrl(details.getExternalUrl());
            item.setParentId(details.getParentId());
            if (details.getDisplayOrder() != null) item.setDisplayOrder(details.getDisplayOrder());
            if (details.getIsVisible() != null) item.setIsVisible(details.getIsVisible());
            if (details.getOpenInNewTab() != null) item.setOpenInNewTab(details.getOpenInNewTab());
            NavigationItem saved = navigationItemRepository.save(item);
            return ResponseEntity.ok(ApiResponse.ok("Menu item updated", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Menu item not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteItem(@PathVariable Long id) {
        return navigationItemRepository.findById(id).map(item -> {
            // Also clean children or set parentId to null
            List<NavigationItem> children = navigationItemRepository.findByParentIdOrderByDisplayOrderAsc(id);
            for (NavigationItem child : children) {
                child.setParentId(null);
                navigationItemRepository.save(child);
            }
            navigationItemRepository.delete(item);
            return ResponseEntity.ok(ApiResponse.ok("Menu item deleted", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Menu item not found")));
    }

    @PostMapping("/reorder")
    @Transactional
    public ResponseEntity<ApiResponse<String>> reorderItems(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long id = Long.valueOf(item.get("id").toString());
            Integer order = Integer.valueOf(item.get("displayOrder").toString());
            navigationItemRepository.findById(id).ifPresent(n -> {
                n.setDisplayOrder(order);
                if (item.containsKey("parentId")) {
                    Object p = item.get("parentId");
                    n.setParentId(p != null ? Long.valueOf(p.toString()) : null);
                }
                navigationItemRepository.save(n);
            });
        }
        return ResponseEntity.ok(ApiResponse.ok("Navigation reordered successfully", "REORDERED"));
    }
}
