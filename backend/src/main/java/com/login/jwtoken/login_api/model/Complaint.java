package com.login.jwtoken.login_api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    private String department;  // Water, Sanitation, Roads, Electricity, Parks
    private String note;        // municipality's internal comment
    private String complaintId;      // e.g. CMP-2026-0001
    private String residentPhone;    // links complaint to resident
    private String category;         // Pothole, Garbage, etc.
    private String description;
    private String location;
    private String photoUrl;
    private String municipalityId;   // which municipality handles it
    private String status;           // Open, Assigned, In Progress, Closed
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and Setters
    public String getId()                        { return id; }
    public String getComplaintId()               { return complaintId; }
    public void   setComplaintId(String v)       { this.complaintId = v; }
    public String getResidentPhone()             { return residentPhone; }
    public void   setResidentPhone(String v)     { this.residentPhone = v; }
    public String getCategory()                  { return category; }
    public void   setCategory(String v)          { this.category = v; }
    public String getDescription()               { return description; }
    public void   setDescription(String v)       { this.description = v; }
    public String getLocation()                  { return location; }
    public void   setLocation(String v)          { this.location = v; }
    public String getPhotoUrl()                  { return photoUrl; }
    public void   setPhotoUrl(String v)          { this.photoUrl = v; }
    public String getMunicipalityId()            { return municipalityId; }
    public void   setMunicipalityId(String v)    { this.municipalityId = v; }
    public String getStatus()                    { return status; }
    public void   setStatus(String v)            { this.status = v; }
    public Instant getCreatedAt()                { return createdAt; }
    public void    setCreatedAt(Instant v)       { this.createdAt = v; }
    public Instant getUpdatedAt()                { return updatedAt; }
    public void    setUpdatedAt(Instant v)       { this.updatedAt = v; }
    public String getDepartment()            { return department; }
    public void   setDepartment(String v)    { this.department = v; }
    public String getNote()                  { return note; }
    public void   setNote(String v)          { this.note = v; }
}