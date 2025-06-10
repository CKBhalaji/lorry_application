package com.lorry.backend.services;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.exceptions.ResourceNotFoundException;
import com.lorry.backend.payload.request.DisputeRequest;
import com.lorry.backend.payload.request.LoadRequest;
import com.lorry.backend.payload.request.UserProfileUpdateRequest;
import com.lorry.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class GoodsOwnerServiceImpl implements GoodsOwnerService {

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
    @Transactional
    public Load postLoad(Long userId, LoadRequest loadRequest) {
        User goodsOwner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Load load = new Load();
        load.setDescription(loadRequest.getDescription());
        load.setPickupLocation(loadRequest.getPickupLocation());
        load.setDropoffLocation(loadRequest.getDropoffLocation());
        load.setWeight(loadRequest.getWeight());
        load.setPostedByUser(goodsOwner);
        load.setStatus("PENDING"); // Initial status
        load.setPostedDate(LocalDateTime.now()); // Or use @PrePersist in Load entity

        return loadRepository.save(load);
    }

    @Override
    public List<Load> getMyLoads(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return loadRepository.findByPostedByUserId(userId);
    }

    @Override
    public List<Bid> getBidsForLoad(Long userId, Long loadId) {
        Load load = loadRepository.findById(loadId)
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + loadId));
        // Verify goods owner owns the load
        if (!Objects.equals(load.getPostedByUser().getId(), userId)) {
            throw new SecurityException("User not authorized to view bids for this load."); // Or a custom access denied exception
        }
        return bidRepository.findByLoadId(loadId);
    }

    @Override
    @Transactional
    public Bid acceptBid(Long userId, Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found with id: " + bidId));
        Load load = bid.getLoad();

        // Verify goods owner owns the load
        if (!Objects.equals(load.getPostedByUser().getId(), userId)) {
            throw new SecurityException("User not authorized to accept bids for this load.");
        }
        // Ensure load is in a state where bids can be accepted
        if (!"PENDING".equalsIgnoreCase(load.getStatus())) {
            throw new IllegalStateException("Load is not in PENDING state, cannot accept bids.");
        }

        bid.setStatus("ACCEPTED");
        Bid acceptedBid = bidRepository.save(bid);

        load.setAssignedDriver(bid.getUser());
        load.setStatus("ACTIVE"); // Or "ASSIGNED"
        loadRepository.save(load);

        // Optionally, reject other bids for this load
        List<Bid> otherBids = bidRepository.findByLoadIdAndStatus(load.getId(), "PENDING");
        for (Bid otherBid : otherBids) {
            if (!Objects.equals(otherBid.getId(), acceptedBid.getId())) {
                otherBid.setStatus("REJECTED");
                bidRepository.save(otherBid);
            }
        }
        return acceptedBid;
    }

    @Override
    @Transactional
    public Dispute raiseDispute(Long userId, DisputeRequest disputeRequest) {
        User goodsOwner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Load load = loadRepository.findById(disputeRequest.getLoadId())
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + disputeRequest.getLoadId()));

        // Ensure the goods owner is related to the load (either posted by them or involved in some other way)
        // For now, assuming only the one who posted can raise a dispute on it directly, or related to a bid they made.
        // This logic might need refinement based on specific dispute rules.
        if (!Objects.equals(load.getPostedByUser().getId(), userId)) {
             throw new SecurityException("User not authorized to raise dispute for this load directly unless involved.");
        }

        Dispute dispute = new Dispute();
        dispute.setLoad(load);
        dispute.setUser(goodsOwner);
        dispute.setReason(disputeRequest.getReason());
        dispute.setCreatedDate(LocalDateTime.now()); // Or use @PrePersist
        dispute.setStatus("OPEN");

        return disputeRepository.save(dispute);
    }

    @Override
    public List<Dispute> getGoodsOwnerDisputes(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        // This fetches disputes where the GoodsOwner is the one who *raised* it.
        return disputeRepository.findByUserId(userId);
    }

    @Override
    public User getGoodsOwnerProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    @Transactional
    public User updateGoodsOwnerProfile(Long userId, UserProfileUpdateRequest profileDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (profileDetails.getFirstName() != null) {
            user.setFirstName(profileDetails.getFirstName());
        }
        if (profileDetails.getLastName() != null) {
            user.setLastName(profileDetails.getLastName());
        }
        if (profileDetails.getPhoneNumber() != null) {
            user.setPhoneNumber(profileDetails.getPhoneNumber());
        }
        if (profileDetails.getEmail() != null && !profileDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(profileDetails.getEmail())) {
                throw new RuntimeException("Error: Email is already in use by another account.");
            }
            user.setEmail(profileDetails.getEmail());
        }
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
