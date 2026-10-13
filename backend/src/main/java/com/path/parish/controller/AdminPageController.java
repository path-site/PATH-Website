package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.Page;
import com.path.parish.model.PageSection;
import com.path.parish.repository.PageRepository;
import com.path.parish.repository.PageSectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminPageController {

    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;

    public AdminPageController(PageRepository pageRepository, PageSectionRepository pageSectionRepository) {
        this.pageRepository = pageRepository;
        this.pageSectionRepository = pageSectionRepository;
    }

    @GetMapping("/pages")
    public ResponseEntity<ApiResponse<List<Page>>> getAllPages() {
        return ResponseEntity.ok(ApiResponse.ok(pageRepository.findAll()));
    }

    @GetMapping("/pages/{id}")
    public ResponseEntity<ApiResponse<Page>> getPageById(@PathVariable Long id) {
        return pageRepository.findById(id)
                .map(page -> ResponseEntity.ok(ApiResponse.ok(page)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Page not found")));
    }

    @PostMapping("/pages")
    public ResponseEntity<ApiResponse<Page>> createPage(@RequestBody Page page) {
        if (pageRepository.existsBySlug(page.getSlug())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Slug already in use. Please choose another."));
        }
        Page saved = pageRepository.save(page);
        return ResponseEntity.ok(ApiResponse.ok("Page created successfully", saved));
    }

    @PutMapping("/pages/{id}")
    public ResponseEntity<ApiResponse<Page>> updatePage(@PathVariable Long id, @RequestBody Page pageDetails) {
        return pageRepository.findById(id).map(page -> {
            page.setTitle(pageDetails.getTitle());
            page.setSlug(pageDetails.getSlug());
            page.setTemplate(pageDetails.getTemplate());
            page.setSeoTitle(pageDetails.getSeoTitle());
            page.setSeoDescription(pageDetails.getSeoDescription());
            Page updated = pageRepository.save(page);
            return ResponseEntity.ok(ApiResponse.ok("Page updated successfully", updated));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Page not found")));
    }

    @PostMapping("/pages/{id}/publish")
    public ResponseEntity<ApiResponse<Page>> publishPage(@PathVariable Long id) {
        return pageRepository.findById(id).map(page -> {
            page.setStatus("PUBLISHED");
            page.setPublishedAt(LocalDateTime.now());
            Page saved = pageRepository.save(page);
            return ResponseEntity.ok(ApiResponse.ok("Page published successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Page not found")));
    }

    @PostMapping("/pages/{id}/unpublish")
    public ResponseEntity<ApiResponse<Page>> unpublishPage(@PathVariable Long id) {
        return pageRepository.findById(id).map(page -> {
            page.setStatus("DRAFT");
            Page saved = pageRepository.save(page);
            return ResponseEntity.ok(ApiResponse.ok("Page reverted to draft", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Page not found")));
    }

    @DeleteMapping("/pages/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deletePage(@PathVariable Long id) {
        return pageRepository.findById(id).map(page -> {
            pageSectionRepository.deleteByPageId(id);
            pageRepository.delete(page);
            return ResponseEntity.ok(ApiResponse.ok("Page deleted successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Page not found")));
    }

    // SECTION MANAGEMENT
    @GetMapping("/pages/{id}/sections")
    public ResponseEntity<ApiResponse<List<PageSection>>> getPageSections(@PathVariable Long id) {
        List<PageSection> sections = pageSectionRepository.findByPageIdOrderByDisplayOrderAsc(id);
        return ResponseEntity.ok(ApiResponse.ok(sections));
    }

    @PostMapping("/pages/{id}/sections")
    public ResponseEntity<ApiResponse<PageSection>> addSection(@PathVariable Long id, @RequestBody PageSection section) {
        section.setPageId(id);
        if (section.getDisplayOrder() == null) {
            List<PageSection> existing = pageSectionRepository.findByPageIdOrderByDisplayOrderAsc(id);
            section.setDisplayOrder(existing.size());
        }
        PageSection saved = pageSectionRepository.save(section);
        return ResponseEntity.ok(ApiResponse.ok("Section added successfully", saved));
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<ApiResponse<PageSection>> updateSection(@PathVariable Long sectionId, @RequestBody PageSection details) {
        return pageSectionRepository.findById(sectionId).map(s -> {
            s.setTitle(details.getTitle());
            s.setSectionType(details.getSectionType());
            s.setContentJson(details.getContentJson());
            if (details.getIsVisible() != null) s.setIsVisible(details.getIsVisible());
            if (details.getDisplayOrder() != null) s.setDisplayOrder(details.getDisplayOrder());
            PageSection saved = pageSectionRepository.save(s);
            return ResponseEntity.ok(ApiResponse.ok("Section saved successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Section not found")));
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<ApiResponse<String>> deleteSection(@PathVariable Long sectionId) {
        return pageSectionRepository.findById(sectionId).map(s -> {
            pageSectionRepository.delete(s);
            return ResponseEntity.ok(ApiResponse.ok("Section deleted successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Section not found")));
    }

    @PostMapping("/sections/{sectionId}/duplicate")
    public ResponseEntity<ApiResponse<PageSection>> duplicateSection(@PathVariable Long sectionId) {
        return pageSectionRepository.findById(sectionId).map(orig -> {
            PageSection copy = new PageSection();
            copy.setPageId(orig.getPageId());
            copy.setSectionType(orig.getSectionType());
            copy.setTitle(orig.getTitle() + " (Copy)");
            copy.setContentJson(orig.getContentJson());
            copy.setDisplayOrder(orig.getDisplayOrder() + 1);
            copy.setIsVisible(orig.getIsVisible());
            PageSection saved = pageSectionRepository.save(copy);
            return ResponseEntity.ok(ApiResponse.ok("Section duplicated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Section not found")));
    }

    @PostMapping("/sections/reorder")
    @Transactional
    public ResponseEntity<ApiResponse<String>> reorderSections(@RequestBody List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long id = Long.valueOf(item.get("id").toString());
            Integer order = Integer.valueOf(item.get("displayOrder").toString());
            pageSectionRepository.findById(id).ifPresent(s -> {
                s.setDisplayOrder(order);
                pageSectionRepository.save(s);
            });
        }
        return ResponseEntity.ok(ApiResponse.ok("Sections reordered successfully", "REORDERED"));
    }
}
