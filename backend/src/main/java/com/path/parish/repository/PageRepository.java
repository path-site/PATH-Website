package com.path.parish.repository;

import com.path.parish.model.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {
    Optional<Page> findBySlug(String slug);
    Optional<Page> findBySlugAndStatus(String slug, String status);
    List<Page> findByStatus(String status);
    boolean existsBySlug(String slug);
}
