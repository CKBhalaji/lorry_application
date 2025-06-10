package com.lorry.backend.controllers;

import com.lorry.backend.entities.Dispute;
import com.lorry.backend.entities.Load;
import com.lorry.backend.entities.User;
import com.lorry.backend.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600) // Configure properly for production
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Ensures only users with ROLE_ADMIN can access these endpoints
public class AdminController {

    @Autowired
    private AdminService adminService;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateUserEnabledStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusUpdate) {
        // Basic validation for the request body
        if (statusUpdate == null || !statusUpdate.containsKey("enabled")) {
            return ResponseEntity.badRequest().build(); // Or a custom error response
        }
        boolean enabled = statusUpdate.get("enabled");
        User updatedUser = adminService.updateUserEnabledStatus(id, enabled);
        return ResponseEntity.ok(updatedUser);
    }

    // Load Management
    @GetMapping("/loads")
    public ResponseEntity<List<Load>> getAllLoads() {
        List<Load> loads = adminService.getAllLoads();
        return ResponseEntity.ok(loads);
    }

    @PutMapping("/loads/{id}/status")
    public ResponseEntity<Load> updateLoadStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        if (statusUpdate == null || !statusUpdate.containsKey("status") || statusUpdate.get("status").isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String status = statusUpdate.get("status");
        Load updatedLoad = adminService.updateLoadStatus(id, status);
        return ResponseEntity.ok(updatedLoad);
    }

    // Dispute Management
    @GetMapping("/disputes")
    public ResponseEntity<List<Dispute>> getAllDisputes() {
        List<Dispute> disputes = adminService.getAllDisputes();
        return ResponseEntity.ok(disputes);
    }

    @PutMapping("/disputes/{id}/status")
    public ResponseEntity<Dispute> updateDisputeStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
         if (statusUpdate == null || !statusUpdate.containsKey("status") || statusUpdate.get("status").isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String status = statusUpdate.get("status");
        Dispute updatedDispute = adminService.updateDisputeStatus(id, status);
        return ResponseEntity.ok(updatedDispute);
    }
}
