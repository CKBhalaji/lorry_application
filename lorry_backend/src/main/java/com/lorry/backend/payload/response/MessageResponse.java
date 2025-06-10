package com.lorry.backend.payload.response;

// Not using Lombok, so manual constructor, getters/setters
public class MessageResponse {
    private String message;

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
