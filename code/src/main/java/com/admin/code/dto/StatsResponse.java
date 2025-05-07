package com.admin.code.dto;

public class StatsResponse {
    private int totalLogs;
    private int lockedUsers;
    private int flaggedLogs;

    public StatsResponse(int totalLogs, int lockedUsers, int flaggedLogs) {
        this.totalLogs = totalLogs;
        this.lockedUsers = lockedUsers;
        this.flaggedLogs = flaggedLogs;
    }

    public int getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(int totalLogs) {
        this.totalLogs = totalLogs;
    }

    public int getLockedUsers() {
        return lockedUsers;
    }

    public void setLockedUsers(int lockedUsers) {
        this.lockedUsers = lockedUsers;
    }

    public int getFlaggedLogs() {
        return flaggedLogs;
    }

    public void setFlaggedLogs(int flaggedLogs) {
        this.flaggedLogs = flaggedLogs;
    }
}

