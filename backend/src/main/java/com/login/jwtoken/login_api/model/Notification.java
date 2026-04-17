package com.login.jwtoken.login_api.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String residentPhone;  // which resident this belongs to
    private String message;
    private String type;           // STATUS_UPDATE or ANNOUNCEMENT
    private boolean read;
    private Instant createdAt;

    // Getters and Setters
    public String getId()                    { return id; }

    public String getResidentPhone()         { return residentPhone; }
    public void   setResidentPhone(String v) { this.residentPhone = v; }

    public String getMessage()               { return message; }
    public void   setMessage(String v)       { this.message = v; }

    public String getType()                  { return type; }
    public void   setType(String v)          { this.type = v; }

    public boolean isRead()                  { return read; }
    public void    setRead(boolean v)        { this.read = v; }

    public Instant getCreatedAt()            { return createdAt; }
    public void    setCreatedAt(Instant v)   { this.createdAt = v; }
}