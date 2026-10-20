package com.path.parish.dto;

import java.time.LocalDateTime;

public class MediaFileDto {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String storageProvider;
    private String mimeType;
    private Long fileSize;
    private String altText;
    private String caption;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MediaFileDto() {}

    public MediaFileDto(Long id, String fileName, String fileUrl, String storageProvider,
                        String mimeType, Long fileSize, String altText, String caption,
                        String uploadedBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.storageProvider = storageProvider;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.altText = altText;
        this.caption = caption;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStorageProvider() { return storageProvider; }
    public void setStorageProvider(String storageProvider) { this.storageProvider = storageProvider; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
