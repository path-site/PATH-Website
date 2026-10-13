package com.path.parish.repository;

import com.path.parish.model.HistoryMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoryMilestoneRepository extends JpaRepository<HistoryMilestone, Long> {
    List<HistoryMilestone> findAllByOrderByDisplayOrderAsc();
    List<HistoryMilestone> findByIsPublishedTrueOrderByDisplayOrderAsc();
}
