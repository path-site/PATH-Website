package com.path.parish.repository;

import com.path.parish.model.ParishEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParishEventRepository extends JpaRepository<ParishEvent, Long> {
    List<ParishEvent> findAllByOrderByStartDatetimeAsc();
    List<ParishEvent> findByStatusOrderByStartDatetimeAsc(String status);
    List<ParishEvent> findByStatusAndStartDatetimeGreaterThanEqualOrderByStartDatetimeAsc(String status, LocalDateTime now);
    List<ParishEvent> findByStatusAndStartDatetimeLessThanOrderByStartDatetimeDesc(String status, LocalDateTime now);
    Optional<ParishEvent> findBySlugAndStatus(String slug, String status);
    Optional<ParishEvent> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
