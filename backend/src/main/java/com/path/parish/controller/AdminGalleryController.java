package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.GalleryAlbum;
import com.path.parish.model.GalleryImage;
import com.path.parish.repository.GalleryAlbumRepository;
import com.path.parish.repository.GalleryImageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/gallery")
@CrossOrigin(origins = "*")
public class AdminGalleryController {

    private final GalleryAlbumRepository albumRepository;
    private final GalleryImageRepository imageRepository;

    public AdminGalleryController(GalleryAlbumRepository albumRepository, GalleryImageRepository imageRepository) {
        this.albumRepository = albumRepository;
        this.imageRepository = imageRepository;
    }

    @GetMapping("/albums")
    public ResponseEntity<ApiResponse<List<GalleryAlbum>>> getAllAlbums() {
        return ResponseEntity.ok(ApiResponse.ok(albumRepository.findAllByOrderByDisplayOrderAsc()));
    }

    @PostMapping("/albums")
    public ResponseEntity<ApiResponse<GalleryAlbum>> createAlbum(@RequestBody GalleryAlbum album) {
        if (album.getDisplayOrder() == null) {
            album.setDisplayOrder(albumRepository.findAll().size());
        }
        GalleryAlbum saved = albumRepository.save(album);
        return ResponseEntity.ok(ApiResponse.ok("Album created successfully", saved));
    }

    @PutMapping("/albums/{id}")
    public ResponseEntity<ApiResponse<GalleryAlbum>> updateAlbum(
            @PathVariable Long id, @RequestBody GalleryAlbum details) {
        return albumRepository.findById(id).map(a -> {
            a.setTitle(details.getTitle());
            a.setDescription(details.getDescription());
            a.setCoverImageUrl(details.getCoverImageUrl());
            if (details.getStatus() != null) a.setStatus(details.getStatus());
            if (details.getDisplayOrder() != null) a.setDisplayOrder(details.getDisplayOrder());
            GalleryAlbum saved = albumRepository.save(a);
            return ResponseEntity.ok(ApiResponse.ok("Album updated successfully", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Album not found")));
    }

    @DeleteMapping("/albums/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteAlbum(@PathVariable Long id) {
        return albumRepository.findById(id).map(a -> {
            imageRepository.deleteByAlbumId(id);
            albumRepository.delete(a);
            return ResponseEntity.ok(ApiResponse.ok("Album deleted", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Album not found")));
    }

    @GetMapping("/albums/{albumId}/images")
    public ResponseEntity<ApiResponse<List<GalleryImage>>> getAlbumImages(@PathVariable Long albumId) {
        return ResponseEntity.ok(ApiResponse.ok(imageRepository.findByAlbumIdOrderByDisplayOrderAsc(albumId)));
    }

    @PostMapping("/albums/{albumId}/images")
    public ResponseEntity<ApiResponse<GalleryImage>> addImage(
            @PathVariable Long albumId, @RequestBody GalleryImage img) {
        img.setAlbumId(albumId);
        if (img.getDisplayOrder() == null) {
            img.setDisplayOrder(imageRepository.findByAlbumIdOrderByDisplayOrderAsc(albumId).size());
        }
        GalleryImage saved = imageRepository.save(img);
        return ResponseEntity.ok(ApiResponse.ok("Image added to album", saved));
    }

    @PutMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<GalleryImage>> updateImage(
            @PathVariable Long imageId, @RequestBody GalleryImage details) {
        return imageRepository.findById(imageId).map(img -> {
            img.setCaption(details.getCaption());
            if (details.getImageUrl() != null) img.setImageUrl(details.getImageUrl());
            if (details.getDisplayOrder() != null) img.setDisplayOrder(details.getDisplayOrder());
            GalleryImage saved = imageRepository.save(img);
            return ResponseEntity.ok(ApiResponse.ok("Image updated", saved));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Image not found")));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<String>> deleteImage(@PathVariable Long imageId) {
        return imageRepository.findById(imageId).map(img -> {
            imageRepository.delete(img);
            return ResponseEntity.ok(ApiResponse.ok("Image removed from album", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Image not found")));
    }
}
