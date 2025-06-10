package com.lorry.backend.payload.request;

public class LoadRequest {
    private String description;
    private String pickupLocation;
    private String dropoffLocation;
    private Double weight;

    // Getters
    public String getDescription() {
        return description;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public String getDropoffLocation() {
        return dropoffLocation;
    }

    public Double getWeight() {
        return weight;
    }

    // Setters
    public void setDescription(String description) {
        this.description = description;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public void setDropoffLocation(String dropoffLocation) {
        this.dropoffLocation = dropoffLocation;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }
}
