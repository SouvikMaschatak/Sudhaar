package com.login.jwtoken.login_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "refreshTokens")
public class RefreshToken {

    @Id
    private String id;

    private String token;
    private Instant expiryDate;

    // Just store the ID and type — no more @DBRef to User
    private String ownerId;   // resident's or municipality's MongoDB _id
    private String ownerType; // "RESIDENT" or "MUNICIPALITY"

    // Getters and Setters
    public String getId()                    { return id; }
    public void   setId(String id)           { this.id = id; }

    public String getToken()                 { return token; }
    public void   setToken(String token)     { this.token = token; }

    public Instant getExpiryDate()                   { return expiryDate; }
    public void    setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }

    public String getOwnerId()               { return ownerId; }
    public void   setOwnerId(String v)       { this.ownerId = v; }

    public String getOwnerType()             { return ownerType; }
    public void   setOwnerType(String v)     { this.ownerType = v; }
}