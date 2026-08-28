package com.smartfleet.smartfleet.entity;

public enum UserRole {
    ADMIN("admin"),
    GESTIONNAIRE("gestionnaire"),
    CONDUCTEUR("conducteur");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
