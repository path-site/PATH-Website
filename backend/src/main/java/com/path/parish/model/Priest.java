package com.path.parish.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "priests")
public class Priest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String title; // Parish Priest, Parochial Vicar, Guest Priest

    @Column(columnDefinition = "TEXT")
    private String biography;

    private String portraitImageUrl;

    private String serviceStart; // e.g. "2021" or "2015"
    private String serviceEnd;   // e.g. "Present" or "2021"

    @Column(nullable = false)
    private String priestStatus; // CURRENT, FORMER

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean isPublished = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.priestStatus == null) this.priestStatus = "CURRENT";
        if (this.isPublished == null) this.isPublished = true;
        if (this.displayOrder == null) this.displayOrder = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Priest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }
    public String getPortraitImageUrl() { return portraitImageUrl; }
    public void setPortraitImageUrl(String portraitImageUrl) { this.portraitImageUrl = portraitImageUrl; }
    public String getServiceStart() { return serviceStart; }
    public void setServiceStart(String serviceStart) { this.serviceStart = serviceStart; }
    public String getServiceEnd() { return serviceEnd; }
    public void setServiceEnd(String serviceEnd) { this.serviceEnd = serviceEnd; }
    public String getPriestStatus() { return priestStatus; }
    public void setPriestStatus(String priestStatus) { this.priestStatus = priestStatus; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean published) { isPublished = published; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
