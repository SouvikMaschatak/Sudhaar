package com.login.jwtoken.login_api.repository;

import com.login.jwtoken.login_api.model.Complaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    // get all complaints for a specific resident
    List<Complaint> findByResidentPhone(String residentPhone);
    List<Complaint> findByMunicipalityId(String municipalityId);
    // count complaints with a given ID prefix — used for auto-generating IDs
    long countByComplaintIdStartingWith(String prefix);
}