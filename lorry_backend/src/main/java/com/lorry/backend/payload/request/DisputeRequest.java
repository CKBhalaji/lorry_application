package com.lorry.backend.payload.request;

public class DisputeRequest {
    private Long loadId;
    private String reason;

    // Getters
    public Long getLoadId() {
        return loadId;
    }

    public String getReason() {
        return reason;
    }

    // Setters
    public void setLoadId(Long loadId) {
        this.loadId = loadId;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
