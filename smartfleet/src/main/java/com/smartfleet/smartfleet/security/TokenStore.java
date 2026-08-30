package com.smartfleet.smartfleet.security;

import com.smartfleet.smartfleet.entity.User;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {
    private final Map<String, String> tokenToUserId = new ConcurrentHashMap<>();

    public void register(String token, User user) {
        tokenToUserId.put(token, user.getId());
    }

    public Optional<String> resolveUserId(String token) {
        return Optional.ofNullable(tokenToUserId.get(token));
    }

    public void revoke(String token) {
        tokenToUserId.remove(token);
    }
}
