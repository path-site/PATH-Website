package com.path.parish.repository;

import com.path.parish.dto.MediaFileDto;
import com.path.parish.model.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {

    @Query("SELECT new com.path.parish.dto.MediaFileDto(m.id, m.fileName, m.fileUrl, m.storageProvider, m.mimeType, m.fileSize, m.altText, m.caption, m.uploadedBy, m.createdAt, m.updatedAt) FROM MediaFile m ORDER BY m.createdAt DESC")
    List<MediaFileDto> findAllSummaries();

    @Query("SELECT new com.path.parish.dto.MediaFileDto(m.id, m.fileName, m.fileUrl, m.storageProvider, m.mimeType, m.fileSize, m.altText, m.caption, m.uploadedBy, m.createdAt, m.updatedAt) FROM MediaFile m WHERE LOWER(m.fileName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    List<MediaFileDto> findSummariesByFileNameContainingIgnoreCase(@Param("query") String query);

    List<MediaFile> findAllByOrderByCreatedAtDesc();
    List<MediaFile> findByFileNameContainingIgnoreCaseOrderByCreatedAtDesc(String query);
}
