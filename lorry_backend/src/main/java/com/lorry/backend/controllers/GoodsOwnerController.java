package com.lorry.backend.controllers;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.exceptions.ResourceNotFoundException;
import com.lorry.backend.payload.request.*;
import com.lorry.backend.repositories.UserRepository;
import com.lorry.backend.services.GoodsOwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/goods-owner")
@PreAuthorize("hasRole('GOODS_OWNER')")
public class GoodsOwnerController {

    @Autowired
    private GoodsOwnerService goodsOwnerService;

    @Autowired
    private UserRepository userRepository; // To fetch user ID

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User not authenticated");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database"));
    }

    @PostMapping("/loads")
    public ResponseEntity<Load> postLoad(@RequestBody LoadRequest loadRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        Load postedLoad = goodsOwnerService.postLoad(currentUser.getId(), loadRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(postedLoad);
    }

    @GetMapping("/loads")
    public ResponseEntity<List<Load>> getMyLoads() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Load> loads = goodsOwnerService.getMyLoads(currentUser.getId());
        return ResponseEntity.ok(loads);
    }

    @GetMapping("/loads/{loadId}/bids")
    public ResponseEntity<List<Bid>> getBidsForLoad(@PathVariable Long loadId) {
        User currentUser = getCurrentAuthenticatedUser();
        List<Bid> bids = goodsOwnerService.getBidsForLoad(currentUser.getId(), loadId);
        return ResponseEntity.ok(bids);
    }

    @PutMapping("/bids/{bidId}/accept")
    public ResponseEntity<Bid> acceptBid(@PathVariable Long bidId) {
        User currentUser = getCurrentAuthenticatedUser();
        Bid acceptedBid = goodsOwnerService.acceptBid(currentUser.getId(), bidId);
        return ResponseEntity.ok(acceptedBid);
    }

    @PostMapping("/disputes")
    public ResponseEntity<Dispute> raiseDispute(@RequestBody DisputeRequest disputeRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        Dispute raisedDispute = goodsOwnerService.raiseDispute(currentUser.getId(), disputeRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(raisedDispute);
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<Dispute>> getGoodsOwnerDisputes() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Dispute> disputes = goodsOwnerService.getGoodsOwnerDisputes(currentUser.getId());
        return ResponseEntity.ok(disputes);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getGoodsOwnerProfile() {
        User currentUser = getCurrentAuthenticatedUser();
        User profile = goodsOwnerService.getGoodsOwnerProfile(currentUser.getId());
        profile.setPassword(null); // Mask password
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateGoodsOwnerProfile(@RequestBody UserProfileUpdateRequest profileDetails) {
        User currentUser = getCurrentAuthenticatedUser();
        User updatedProfile = goodsOwnerService.updateGoodsOwnerProfile(currentUser.getId(), profileDetails);
        updatedProfile.setPassword(null); // Mask password
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        if (changePasswordRequest.getNewPassword() == null || changePasswordRequest.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty.");
        }
        goodsOwnerService.changePassword(currentUser.getId(), changePasswordRequest.getNewPassword());
        return ResponseEntity.ok("Password changed successfully.");
    }
}
