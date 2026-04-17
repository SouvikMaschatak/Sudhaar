package com.login.jwtoken.login_api.security;

import com.login.jwtoken.login_api.model.RefreshToken;
import com.login.jwtoken.login_api.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Value("${jwt.refreshExpiration}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Creates a refresh token for either a resident or municipality
    // ownerType should be "RESIDENT" or "MUNICIPALITY"
    public RefreshToken createRefreshToken(String ownerId, String ownerType) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setOwnerId(ownerId);
        refreshToken.setOwnerType(ownerType);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(refreshToken);
    }

    public boolean isValid(RefreshToken token) {
        return token.getExpiryDate().isAfter(Instant.now());
    }

    public RefreshToken getByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }

    public void deleteById(String id) {
        refreshTokenRepository.deleteById(id);
    }

    public void deleteByOwnerId(String ownerId) {
        refreshTokenRepository.deleteByOwnerId(ownerId);
    }
}