package com.admin.code.repository;

import com.admin.code.model.ReadingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReadingLogRepository extends JpaRepository<ReadingLog, Long> {
    List<ReadingLog> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
    int countByFlaggedTrue();
}
