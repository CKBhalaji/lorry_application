package com.lorry.backend.payload.request;

import java.math.BigDecimal;

public class BidRequest {
    private Long loadId;
    private BigDecimal bidAmount;

    // Getters
    public Long getLoadId() {
        return loadId;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    // Setters
    public void setLoadId(Long loadId) {
        this.loadId = loadId;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }
}
