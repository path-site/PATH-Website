package com.path.parish.repository;

import com.path.parish.model.Priest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PriestRepository extends JpaRepository<Priest, Long> {
    List<Priest> findAllByOrderByDisplayOrderAsc();
    List<Priest> findByIsPublishedTrueOrderByDisplayOrderAsc();
    List<Priest> findByPriestStatusAndIsPublishedTrueOrderByDisplayOrderAsc(String priestStatus);
}
