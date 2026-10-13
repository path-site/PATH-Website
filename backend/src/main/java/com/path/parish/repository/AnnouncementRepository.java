package com.path.parish.repository;

import com.path.parish.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    List<Announcement> findByStatusOrderByPublishedAtDesc(String status);
    List<Announcement> findByStatusAndCategoryOrderByPublishedAtDesc(String status, String category);
    Optional<Announcement> findBySlugAndStatus(String slug, String status);
    Optional<Announcement> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT a FROM Announcement a WHERE a.status = :status AND " +
           "(LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.summary) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.publishedAt DESC")
    List<Announcement> searchPublished(@Param("status") String status, @Param("query") String query);
}
