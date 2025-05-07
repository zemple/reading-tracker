package com.admin.code.service;

import com.admin.code.dto.StatsResponse;
import com.admin.code.model.ReadingLog;
import com.admin.code.repository.ReadingLogRepository;
import com.admin.code.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DashboardService {

    private final ReadingLogRepository logRepository;
    private final UserRepository userRepository;

    @Autowired
    public DashboardService(ReadingLogRepository logRepository, UserRepository userRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
    }

    public StatsResponse getSystemStats() {
        int totalLogs = (int) logRepository.count();
        int lockedUsers = userRepository.countByLockedTrue();
        int flaggedLogs = logRepository.countByFlaggedTrue();

        return new StatsResponse(totalLogs, lockedUsers, flaggedLogs);
    }

    public List<ReadingLog> getAllLogs() {
        return logRepository.findAll();
    }

    public List<ReadingLog> searchLogs(String query) {
        return logRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
    }
}

