package com.login.jwtoken.login_api.repository;

import com.login.jwtoken.login_api.model.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByOwnerId(String ownerId); // replaces deleteByUser
}