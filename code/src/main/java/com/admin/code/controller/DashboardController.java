package com.admin.code.controller;

import com.admin.code.dto.StatsResponse;
import com.admin.code.model.ReadingLog;
import com.admin.code.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getSystemStats() {
        return ResponseEntity.ok(dashboardService.getSystemStats());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<ReadingLog>> getLogs() {
        return ResponseEntity.ok(dashboardService.getAllLogs());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ReadingLog>> searchLogs(@RequestParam String query) {
        return ResponseEntity.ok(dashboardService.searchLogs(query));
    }
}
