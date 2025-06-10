package com.lorry.backend.services;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.payload.request.DisputeRequest;
import com.lorry.backend.payload.request.LoadRequest;
import com.lorry.backend.payload.request.UserProfileUpdateRequest;
// Assuming ChangePasswordRequest is already created and available
// import com.lorry.backend.payload.request.ChangePasswordRequest;

import java.util.List;

public interface GoodsOwnerService {
    Load postLoad(Long userId, LoadRequest loadRequest);
    List<Load> getMyLoads(Long userId);
    List<Bid> getBidsForLoad(Long userId, Long loadId);
    Bid acceptBid(Long userId, Long bidId);
    Dispute raiseDispute(Long userId, DisputeRequest disputeRequest);
    List<Dispute> getGoodsOwnerDisputes(Long userId);
    User getGoodsOwnerProfile(Long userId);
    User updateGoodsOwnerProfile(Long userId, UserProfileUpdateRequest profileDetails);
    void changePassword(Long userId, String newPassword); // Changed from ChangePasswordRequest for directness
}
