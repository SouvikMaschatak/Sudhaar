package com.login.jwtoken.login_api.repository;

import com.login.jwtoken.login_api.model.resident;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ResidentRepository extends MongoRepository<resident, String> {
    Optional<resident> findByPhone(String phone);
}