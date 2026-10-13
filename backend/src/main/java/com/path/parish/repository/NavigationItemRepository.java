package com.path.parish.repository;

import com.path.parish.model.NavigationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NavigationItemRepository extends JpaRepository<NavigationItem, Long> {
    List<NavigationItem> findAllByOrderByDisplayOrderAsc();
    List<NavigationItem> findByIsVisibleTrueOrderByDisplayOrderAsc();
    List<NavigationItem> findByParentIdIsNullOrderByDisplayOrderAsc();
    List<NavigationItem> findByParentIdOrderByDisplayOrderAsc(Long parentId);
}
