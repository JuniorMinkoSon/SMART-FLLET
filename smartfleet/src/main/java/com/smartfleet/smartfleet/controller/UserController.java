package com.smartfleet.smartfleet.controller;

import com.smartfleet.smartfleet.dto.CreateUserRequest;
import com.smartfleet.smartfleet.dto.UserResponse;
import com.smartfleet.smartfleet.entity.AuditEventType;
import com.smartfleet.smartfleet.entity.User;
import com.smartfleet.smartfleet.security.SecurityUtil;
import com.smartfleet.smartfleet.service.AuditService;
import com.smartfleet.smartfleet.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuditService auditService;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request.getEmail(), request.getPassword(),
            request.getName(), request.getRole());
        auditService.log(securityUtil.getCurrentUserId(), AuditEventType.USER_CREATED,
            "User", user.getId(), "Compte " + user.getEmail() + " cree (" + user.getRole() + ")");
        return new ResponseEntity<>(UserResponse.from(user), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream()
            .map(UserResponse::from).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTIONNAIRE')")
    public ResponseEntity<UserResponse> getUser(@PathVariable String id) {
        return userService.getUserById(id)
            .map(UserResponse::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        auditService.log(securityUtil.getCurrentUserId(), AuditEventType.USER_DELETED,
            "User", id, "Compte supprime");
        return ResponseEntity.noContent().build();
    }
}
