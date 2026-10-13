package com.path.parish.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.path.parish.dto.ApiResponse;
import com.path.parish.model.MediaFile;
import com.path.parish.repository.MediaFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/media")
@CrossOrigin(origins = "*")
public class AdminMediaController {

    private final MediaFileRepository mediaFileRepository;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${app.cloudinary.api-key:}")
    private String cloudinaryApiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

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
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = "";
            int extIndex = originalFileName.lastIndexOf(".");
            if (extIndex > 0) {
                extension = originalFileName.substring(extIndex);
            }

            String fileUrl;
            String storageProvider = "LOCAL";

            // If Cloudinary credentials are provided, upload to Cloudinary
            if (cloudinaryApiKey != null && !cloudinaryApiKey.isBlank() &&
                cloudinaryApiSecret != null && !cloudinaryApiSecret.isBlank() &&
                cloudinaryCloudName != null && !cloudinaryCloudName.isBlank() &&
                !"demo".equals(cloudinaryCloudName)) {
                try {
                    Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                            "cloud_name", cloudinaryCloudName,
                            "api_key", cloudinaryApiKey,
                            "api_secret", cloudinaryApiSecret,
                            "secure", true
                    ));
                    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                            "resource_type", "auto"
                    ));
                    fileUrl = (String) uploadResult.get("secure_url");
                    storageProvider = "CLOUDINARY";
                } catch (Exception ex) {
                    // Fallback to local storage if Cloudinary fails
                    fileUrl = saveLocally(file, extension);
                }
            } else {
                fileUrl = saveLocally(file, extension);
            }

            MediaFile mediaFile = new MediaFile();
            mediaFile.setFileName(originalFileName);
            mediaFile.setFileUrl(fileUrl);
            mediaFile.setStorageProvider(storageProvider);
            mediaFile.setMimeType(file.getContentType());
            mediaFile.setFileSize(file.getSize());
            mediaFile.setAltText(altText);
            mediaFile.setCaption(caption);
            mediaFile.setUploadedBy(SecurityContextHolder.getContext().getAuthentication().getName());

            MediaFile saved = mediaFileRepository.save(mediaFile);
            return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", saved));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMedia(@PathVariable Long id) {
        return mediaFileRepository.findById(id).map(mf -> {
            if ("LOCAL".equalsIgnoreCase(mf.getStorageProvider()) && mf.getFileUrl().startsWith("/uploads/")) {
                try {
                    Path path = Paths.get("." + mf.getFileUrl());
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {}
            }
            mediaFileRepository.delete(mf);
            return ResponseEntity.ok(ApiResponse.ok("File removed successfully", "DELETED"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("Media file not found")));
    }

    private String saveLocally(MultipartFile file, String extension) throws IOException {
        String uniqueName = UUID.randomUUID() + extension;
        File uploadDir = new File("./uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        Path targetPath = Paths.get("./uploads/" + uniqueName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + uniqueName;
    }
}
