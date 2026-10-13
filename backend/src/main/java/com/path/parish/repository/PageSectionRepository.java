package com.path.parish.repository;

import com.path.parish.model.PageSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    List<PageSection> findByPageIdOrderByDisplayOrderAsc(Long pageId);
    List<PageSection> findByPageIdAndIsVisibleTrueOrderByDisplayOrderAsc(Long pageId);
    void deleteByPageId(Long pageId);
}
