package com.login.jwtoken.login_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "municipalities")
public class municipality {

    @Id
    private String id;

    private String corporationName;
    private String corporationCode;
    private String address;
    private String state;
    private String email;
    private String phone;
    private String password;

    @Indexed(unique = true) // generated ID like MUN-WB-2026-0001
    private String municipalityId;

    // Constructors
    public municipality() {}

    // Getters and Setters
    public String getId()                              { return id; }
    public String getCorporationName()                 { return corporationName; }
    public void   setCorporationName(String v)         { this.corporationName = v; }
    public String getCorporationCode()                 { return corporationCode; }
    public void   setCorporationCode(String v)         { this.corporationCode = v; }
    public String getAddress()                         { return address; }
    public void   setAddress(String v)                 { this.address = v; }
    public String getState()                           { return state; }
    public void   setState(String v)                   { this.state = v; }
    public String getEmail()                           { return email; }
    public void   setEmail(String v)                   { this.email = v; }
    public String getPhone()                           { return phone; }
    public void   setPhone(String v)                   { this.phone = v; }
    public String getPassword()                        { return password; }
    public void   setPassword(String v)                { this.password = v; }
    public String getMunicipalityId()                  { return municipalityId; }
    public void   setMunicipalityId(String v)          { this.municipalityId = v; }
}