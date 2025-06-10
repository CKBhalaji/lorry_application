package com.lorry.backend.services;

import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;

import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    User updateUserEnabledStatus(Long userId, boolean enabled);
    List<Load> getAllLoads();
    Load updateLoadStatus(Long loadId, String status);
    List<Dispute> getAllDisputes();
    Dispute updateDisputeStatus(Long disputeId, String status);
}
