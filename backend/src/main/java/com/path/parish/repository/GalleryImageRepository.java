package com.path.parish.repository;

import com.path.parish.model.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {
    List<GalleryImage> findByAlbumIdOrderByDisplayOrderAsc(Long albumId);
    void deleteByAlbumId(Long albumId);
}
