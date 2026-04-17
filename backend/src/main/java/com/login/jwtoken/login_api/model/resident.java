package com.login.jwtoken.login_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "residents")
public class resident {

    @Id
    private String id;

    @Indexed(unique = true) // no two residents can have the same phone
    private String phone;

    private String password;
    private String name;      // NEW
    private String address;   // NEW

    // Constructors
    public resident() {}

    public resident(String phone, String password) {
        this.phone    = phone;
        this.password = password;
    }

    // Getters and Setters
    public String getId()                  { return id; }
    public String getPhone()               { return phone; }
    public void   setPhone(String phone)   { this.phone = phone; }
    public String getPassword()            { return password; }
    public void   setPassword(String p)    { this.password = p; }

    // NEW getters/setters
    public String getName()              { return name; }
    public void   setName(String v)      { this.name = v; }
    public String getAddress()           { return address; }
    public void   setAddress(String v)   { this.address = v; }
}