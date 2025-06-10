package com.lorry.backend.services;

import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.exceptions.ResourceNotFoundException;
import com.lorry.backend.repositories.DisputeRepository;
import com.lorry.backend.repositories.LoadRepository;
import com.lorry.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoadRepository loadRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateUserEnabledStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setEnabled(enabled);
        return userRepository.save(user);
    }

    @Override
    public List<Load> getAllLoads() {
        return loadRepository.findAll();
    }

    @Override
    @Transactional
    public Load updateLoadStatus(Long loadId, String status) {
        Load load = loadRepository.findById(loadId)
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + loadId));
        load.setStatus(status);
        // Potentially add logic here if status change implies other actions, e.g., setting completionDate
        return loadRepository.save(load);
    }

    @Override
    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }

    @Override
    @Transactional
    public Dispute updateDisputeStatus(Long disputeId, String status) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found with id: " + disputeId));
        dispute.setStatus(status);
        // Potentially add logic here if status change implies other actions, e.g., setting resolvedDate
        return disputeRepository.save(dispute);
    }
}
