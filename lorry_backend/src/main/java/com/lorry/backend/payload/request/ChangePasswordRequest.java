package com.lorry.backend.payload.request;

public class ChangePasswordRequest {
    private String newPassword;

    // Getter
    public String getNewPassword() {
        return newPassword;
    }

    // Setter
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
