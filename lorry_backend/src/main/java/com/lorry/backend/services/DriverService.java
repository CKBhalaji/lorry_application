package com.lorry.backend.services;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.payload.request.BidRequest;
import com.lorry.backend.payload.request.DisputeRequest;
import com.lorry.backend.payload.request.UserProfileUpdateRequest;

import java.util.List;

public interface DriverService {
    List<Load> getAvailableLoads();
    Bid submitBid(Long userId, BidRequest bidRequest);
    List<Bid> getBidHistory(Long userId);
    List<Load> getAssignedLoads(Long userId);
    Dispute raiseDispute(Long userId, DisputeRequest disputeRequest);
    List<Dispute> getDriverDisputes(Long userId);
    User getDriverProfile(Long userId);
    User updateDriverProfile(Long userId, UserProfileUpdateRequest profileDetails);
    void changePassword(Long userId, String newPassword);
}
