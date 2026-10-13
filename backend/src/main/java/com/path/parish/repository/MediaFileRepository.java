package com.path.parish.repository;

import com.path.parish.model.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findAllByOrderByCreatedAtDesc();
    List<MediaFile> findByFileNameContainingIgnoreCaseOrderByCreatedAtDesc(String query);
}
