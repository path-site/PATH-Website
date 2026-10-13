package com.path.parish.controller;

import com.path.parish.dto.ApiResponse;
import com.path.parish.model.MediaFile;
import com.path.parish.repository.MediaFileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/media")
@CrossOrigin(origins = "*")
public class AdminMediaController {

    private final MediaFileRepository mediaFileRepository;

    public AdminMediaController(MediaFileRepository mediaFileRepository) {
        this.mediaFileRepository = mediaFileRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MediaFile>>> getMediaFiles(
            @RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(
                    mediaFileRepository.findByFileNameContainingIgnoreCaseOrderByCreatedAtDesc(search.trim())));
        }
        return ResponseEntity.ok(ApiResponse.ok(mediaFileRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<MediaFile>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "caption", required = false) String caption) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please select a file to upload."));
        }

        try {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo");

            MediaFile mediaFile = new MediaFile();
            mediaFile.setFileName(originalFileName);
            mediaFile.setMimeType(file.getContentType());
            mediaFile.setFileSize(file.getSize());
            mediaFile.setAltText(altText != null ? altText : originalFileName);
            mediaFile.setCaption(caption);
            mediaFile.setUploadedBy(SecurityContextHolder.getContext().getAuthentication().getName());
            mediaFile.setStorageProvider("DATABASE");
            mediaFile.setFileData(file.getBytes());
            mediaFile.setFileUrl("");

            MediaFile saved = mediaFileRepository.save(mediaFile);
            saved.setFileUrl("/api/public/media/" + saved.getId());
            saved = mediaFileRepository.save(saved);

            return ResponseEntity.ok(ApiResponse.ok("File uploaded to database successfully", saved));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMedia(@PathVariable Long id) {
        return mediaFileRepository.findById(id).map(mf -> {
            mediaFileRepository.delete(mf);
            return ResponseEntity.ok(ApiResponse.ok("File removed successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Media file not found")));
    }
}
