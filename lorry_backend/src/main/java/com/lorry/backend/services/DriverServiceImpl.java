package com.lorry.backend.services;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.exceptions.ResourceNotFoundException;
import com.lorry.backend.payload.request.BidRequest;
import com.lorry.backend.payload.request.DisputeRequest;
import com.lorry.backend.payload.request.UserProfileUpdateRequest;
import com.lorry.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DriverServiceImpl implements DriverService {

    @Autowired
    private LoadRepository loadRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<Load> getAvailableLoads() {
        // Assuming "PENDING" and "ACTIVE" are statuses for available loads
        // And loads that are available should not have an assigned driver.
        List<String> statuses = Arrays.asList("PENDING", "ACTIVE");
        return loadRepository.findByStatusInAndAssignedDriverIsNull(statuses);
    }

    @Override
    @Transactional
    public Bid submitBid(Long userId, BidRequest bidRequest) {
        User driver = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Load load = loadRepository.findById(bidRequest.getLoadId())
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + bidRequest.getLoadId()));

        // Add validation: e.g., check if load is still available for bidding
        if (load.getAssignedDriver() != null || !"PENDING".equalsIgnoreCase(load.getStatus())) {
            // Ideally, a more specific exception like BidNotAllowedException
            throw new RuntimeException("Load is not available for bidding or already assigned.");
        }

        Bid bid = new Bid();
        bid.setLoad(load);
        bid.setUser(driver);
        bid.setBidAmount(bidRequest.getBidAmount());
        bid.setBidDate(LocalDateTime.now()); // Or use @PrePersist in Bid entity
        bid.setStatus("PENDING"); // Initial status for a new bid

        return bidRepository.save(bid);
    }

    @Override
    public List<Bid> getBidHistory(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return bidRepository.findByUserId(userId);
    }

    @Override
    public List<Load> getAssignedLoads(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return loadRepository.findByAssignedDriverId(userId);
    }

    @Override
    @Transactional
    public Dispute raiseDispute(Long userId, DisputeRequest disputeRequest) {
        User driver = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Load load = loadRepository.findById(disputeRequest.getLoadId())
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + disputeRequest.getLoadId()));

        Dispute dispute = new Dispute();
        dispute.setLoad(load);
        dispute.setUser(driver);
        dispute.setReason(disputeRequest.getReason());
        dispute.setCreatedDate(LocalDateTime.now()); // Or use @PrePersist in Dispute entity
        dispute.setStatus("OPEN"); // Initial status for a new dispute

        return disputeRepository.save(dispute);
    }

    @Override
    public List<Dispute> getDriverDisputes(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return disputeRepository.findByUserId(userId);
    }

    @Override
    public User getDriverProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    @Transactional
    public User updateDriverProfile(Long userId, UserProfileUpdateRequest profileDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Update only allowed fields
        if (profileDetails.getFirstName() != null) {
            user.setFirstName(profileDetails.getFirstName());
        }
        if (profileDetails.getLastName() != null) {
            user.setLastName(profileDetails.getLastName());
        }
        if (profileDetails.getPhoneNumber() != null) {
            user.setPhoneNumber(profileDetails.getPhoneNumber());
        }
        // Handle email update carefully due to unique constraint and verification implications
        if (profileDetails.getEmail() != null && !profileDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(profileDetails.getEmail())) {
                throw new RuntimeException("Error: Email is already in use by another account."); // More specific exception
            }
            user.setEmail(profileDetails.getEmail());
        }
        // Password and roles should not be updated here
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
