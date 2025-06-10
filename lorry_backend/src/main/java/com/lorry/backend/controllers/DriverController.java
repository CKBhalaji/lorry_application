package com.lorry.backend.controllers;

import com.lorry.backend.entities.Bid;
import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.exceptions.ResourceNotFoundException;
import com.lorry.backend.payload.request.BidRequest;
import com.lorry.backend.payload.request.ChangePasswordRequest;
import com.lorry.backend.payload.request.DisputeRequest;
import com.lorry.backend.payload.request.UserProfileUpdateRequest;
import com.lorry.backend.repositories.UserRepository;
import com.lorry.backend.services.DriverService;
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
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private UserRepository userRepository; // To fetch user ID

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("User not authenticated"); // Or handle as needed
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database"));
    }

    @GetMapping("/loads/available")
    public ResponseEntity<List<Load>> getAvailableLoads() {
        List<Load> loads = driverService.getAvailableLoads();
        return ResponseEntity.ok(loads);
    }

    @PostMapping("/bids")
    public ResponseEntity<Bid> submitBid(@RequestBody BidRequest bidRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        Bid submittedBid = driverService.submitBid(currentUser.getId(), bidRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(submittedBid);
    }

    @GetMapping("/bids/history")
    public ResponseEntity<List<Bid>> getBidHistory() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Bid> bids = driverService.getBidHistory(currentUser.getId());
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/loads/assigned")
    public ResponseEntity<List<Load>> getAssignedLoads() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Load> loads = driverService.getAssignedLoads(currentUser.getId());
        return ResponseEntity.ok(loads);
    }

    @PostMapping("/disputes")
    public ResponseEntity<Dispute> raiseDispute(@RequestBody DisputeRequest disputeRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        Dispute raisedDispute = driverService.raiseDispute(currentUser.getId(), disputeRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(raisedDispute);
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<Dispute>> getDriverDisputes() {
        User currentUser = getCurrentAuthenticatedUser();
        List<Dispute> disputes = driverService.getDriverDisputes(currentUser.getId());
        return ResponseEntity.ok(disputes);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getDriverProfile() {
        User currentUser = getCurrentAuthenticatedUser();
        // The User entity might have sensitive data (password), consider a DTO response
        User profile = driverService.getDriverProfile(currentUser.getId());
        profile.setPassword(null); // Mask password for profile response
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateDriverProfile(@RequestBody UserProfileUpdateRequest profileDetails) {
        User currentUser = getCurrentAuthenticatedUser();
        User updatedProfile = driverService.updateDriverProfile(currentUser.getId(), profileDetails);
        updatedProfile.setPassword(null); // Mask password
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest) {
        User currentUser = getCurrentAuthenticatedUser();
        if (changePasswordRequest.getNewPassword() == null || changePasswordRequest.getNewPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("New password cannot be empty.");
        }
        driverService.changePassword(currentUser.getId(), changePasswordRequest.getNewPassword());
        return ResponseEntity.ok("Password changed successfully.");
    }
}
