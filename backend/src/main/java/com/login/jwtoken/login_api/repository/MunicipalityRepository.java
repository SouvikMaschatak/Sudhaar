package com.login.jwtoken.login_api.repository;

import com.login.jwtoken.login_api.model.municipality;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface MunicipalityRepository extends MongoRepository<municipality, String> {
    Optional<municipality> findByMunicipalityId(String municipalityId);
    Optional<municipality> findByCorporationCode(String corporationCode);
    // counts how many municipalities exist from a state prefix — used for ID generation
    long countByMunicipalityIdStartingWith(String prefix);
}