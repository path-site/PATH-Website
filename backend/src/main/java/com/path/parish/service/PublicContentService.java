package com.path.parish.service;

import com.path.parish.model.*;
import com.path.parish.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PublicContentService {

    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;
    private final NavigationItemRepository navigationItemRepository;
    private final AnnouncementRepository announcementRepository;
    private final ParishEventRepository parishEventRepository;
    private final PriestRepository priestRepository;
    private final HistoryMilestoneRepository historyMilestoneRepository;
    private final GalleryAlbumRepository galleryAlbumRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final SiteSettingRepository siteSettingRepository;

    public PublicContentService(
            PageRepository pageRepository,
            PageSectionRepository pageSectionRepository,
            NavigationItemRepository navigationItemRepository,
            AnnouncementRepository announcementRepository,
            ParishEventRepository parishEventRepository,
            PriestRepository priestRepository,
            HistoryMilestoneRepository historyMilestoneRepository,
            GalleryAlbumRepository galleryAlbumRepository,
            GalleryImageRepository galleryImageRepository,
            SiteSettingRepository siteSettingRepository) {
        this.pageRepository = pageRepository;
        this.pageSectionRepository = pageSectionRepository;
        this.navigationItemRepository = navigationItemRepository;
        this.announcementRepository = announcementRepository;
        this.parishEventRepository = parishEventRepository;
        this.priestRepository = priestRepository;
        this.historyMilestoneRepository = historyMilestoneRepository;
        this.galleryAlbumRepository = galleryAlbumRepository;
        this.galleryImageRepository = galleryImageRepository;
        this.siteSettingRepository = siteSettingRepository;
    }

    public List<Map<String, Object>> getNavigationTree() {
        List<NavigationItem> allItems = navigationItemRepository.findByIsVisibleTrueOrderByDisplayOrderAsc();
        List<Map<String, Object>> rootList = new ArrayList<>();
        Map<Long, List<Map<String, Object>>> childrenMap = new HashMap<>();

        for (NavigationItem item : allItems) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("label", item.getLabel());
            map.put("destinationType", item.getDestinationType());
            map.put("targetPath", item.getTargetPath());
            map.put("externalUrl", item.getExternalUrl());
            map.put("parentId", item.getParentId());
            map.put("displayOrder", item.getDisplayOrder());
            map.put("openInNewTab", item.getOpenInNewTab());

            if (item.getParentId() != null) {
                childrenMap.computeIfAbsent(item.getParentId(), k -> new ArrayList<>()).add(map);
            } else {
                rootList.add(map);
            }
        }

        for (Map<String, Object> rootItem : rootList) {
            Long rootId = (Long) rootItem.get("id");
            rootItem.put("children", childrenMap.getOrDefault(rootId, Collections.emptyList()));
        }

        return rootList;
    }

    public Map<String, Object> getPageWithSections(String slug) {
        Page page = pageRepository.findBySlugAndStatus(slug, "PUBLISHED")
                .orElseThrow(() -> new RuntimeException("Page not found: " + slug));

        List<PageSection> sections = pageSectionRepository
                .findByPageIdAndIsVisibleTrueOrderByDisplayOrderAsc(page.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("page", page);
        response.put("sections", sections);
        return response;
    }

    public List<Announcement> getAnnouncements(String category, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return announcementRepository.searchPublished("PUBLISHED", query.trim());
        }
        if (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category)) {
            return announcementRepository.findByStatusAndCategoryOrderByPublishedAtDesc("PUBLISHED", category.trim());
        }
        return announcementRepository.findByStatusOrderByPublishedAtDesc("PUBLISHED");
    }

    public Announcement getAnnouncementBySlug(String slug) {
        return announcementRepository.findBySlugAndStatus(slug, "PUBLISHED")
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + slug));
    }

    public List<ParishEvent> getUpcomingEvents() {
        return parishEventRepository.findByStatusAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(
                "PUBLISHED", LocalDateTime.now());
    }

    public List<ParishEvent> getPastEvents() {
        return parishEventRepository.findByStatusAndStartDatetimeLessThanOrderByStartDatetimeDesc(
                "PUBLISHED", LocalDateTime.now());
    }

    public ParishEvent getEventBySlug(String slug) {
        return parishEventRepository.findBySlugAndStatus(slug, "PUBLISHED")
                .orElseThrow(() -> new RuntimeException("Event not found: " + slug));
    }

    public List<Priest> getPriests() {
        return priestRepository.findByIsPublishedTrueOrderByDisplayOrderAsc();
    }

    public List<HistoryMilestone> getHistoryMilestones() {
        return historyMilestoneRepository.findByIsPublishedTrueOrderByDisplayOrderAsc();
    }

    public List<Map<String, Object>> getGalleryAlbums() {
        List<GalleryAlbum> albums = galleryAlbumRepository.findByStatusOrderByDisplayOrderAsc("PUBLISHED");
        List<Map<String, Object>> result = new ArrayList<>();

        for (GalleryAlbum album : albums) {
            Map<String, Object> map = new HashMap<>();
            map.put("album", album);
            List<GalleryImage> images = galleryImageRepository.findByAlbumIdOrderByDisplayOrderAsc(album.getId());
            map.put("images", images);
            result.add(map);
        }
        return result;
    }

    public Map<String, String> getAllSettings() {
        List<SiteSetting> list = siteSettingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (SiteSetting s : list) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return map;
    }
}
