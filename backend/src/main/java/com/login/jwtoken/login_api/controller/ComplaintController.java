package com.login.jwtoken.login_api.controller;

import com.login.jwtoken.login_api.model.Complaint;
import com.login.jwtoken.login_api.model.Notification;
import com.login.jwtoken.login_api.repository.ComplaintRepository;
import com.login.jwtoken.login_api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // ── Generate complaint ID ──────────────────────────────
    // Format: CMP-{YEAR}-{SEQUENCE} e.g. CMP-2026-0001
    private String generateComplaintId() {
        int year = Year.now().getValue();
        String prefix = "CMP-" + year + "-";
        long count = complaintRepository.countByComplaintIdStartingWith(prefix);
        return prefix + String.format("%04d", count + 1);
    }

    // ── GET all complaints for a resident ─────────────────
    // Protected — requires valid JWT token
    @GetMapping("/resident/{phone}")
    public ResponseEntity<List<Complaint>> getByResident(@PathVariable String phone) {
        List<Complaint> complaints = complaintRepository.findByResidentPhone(phone);
        return ResponseEntity.ok(complaints);
    }

    // ── POST create a new complaint ───────────────────────
    // Called from mobile app when resident raises a complaint
    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, String> body) {
        Complaint complaint = new Complaint();
        complaint.setComplaintId(generateComplaintId());
        complaint.setResidentPhone(body.get("residentPhone"));
        complaint.setCategory(body.get("category"));
        complaint.setDescription(body.get("description"));
        complaint.setLocation(body.get("location"));
        complaint.setPhotoUrl(body.get("photoUrl"));
        complaint.setMunicipalityId(body.get("municipalityId"));
        complaint.setStatus("Open");                    // always starts as Open
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(Instant.now());

        complaintRepository.save(complaint);

        return ResponseEntity.ok(Map.of(
            "message",     "Complaint raised successfully",
            "complaintId", complaint.getComplaintId()
        ));
    }

    // ── PUT update complaint status ───────────────────────
    // Called by municipality dashboard when they change the status.
    // Automatically creates a notification for the resident.
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id,@RequestBody Map<String, String> body) {

        // Find complaint by MongoDB _id
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Complaint not found.");
        }

        String newStatus = body.get("status");
        String oldStatus = complaint.getStatus();

        // Update the status
        complaint.setStatus(newStatus);
        complaint.setUpdatedAt(Instant.now());
        complaintRepository.save(complaint);

        // Auto-create notification for the resident
        Notification notification = new Notification();
        notification.setResidentPhone(complaint.getResidentPhone());
        notification.setMessage(
            "Your complaint #" + complaint.getComplaintId() +
            " status changed from " + oldStatus + " to " + newStatus + "."
        );
        notification.setType("STATUS_UPDATE");
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of(
            "message", "Status updated and notification sent.",
            "status",  newStatus
        ));
    }

    // ── GET all complaints for a municipality ─────────────────
    @GetMapping("/municipality/{municipalityId}")
    public ResponseEntity<List<Complaint>> getByMunicipality(@PathVariable String municipalityId) {
        List<Complaint> complaints = complaintRepository.findByMunicipalityId(municipalityId);
        return ResponseEntity.ok(complaints);
    }

// ── PUT update complaint details ──────────────────────────
// Updates status, department, and note in one call.
// Auto-creates notification if status changed.
    @PutMapping("/{id}/details")
    public ResponseEntity<?> updateDetails(@PathVariable String id,@RequestBody Map<String, String> body) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Complaint not found.");
        }

        String oldStatus = complaint.getStatus();
        String newStatus = body.get("status");
        String department = body.get("department");
        String note = body.get("note");

        // Update fields
        if (newStatus   != null) complaint.setStatus(newStatus);
        if (department  != null) complaint.setDepartment(department);
        if (note        != null) complaint.setNote(note);
        complaint.setUpdatedAt(Instant.now());
        complaintRepository.save(complaint);

        // Auto-create notification only if status actually changed
        if (newStatus != null && !newStatus.equals(oldStatus)) {
            Notification notification = new Notification();
            notification.setResidentPhone(complaint.getResidentPhone());
            notification.setMessage(
                "Your complaint #" + complaint.getComplaintId() +
                " status changed from " + oldStatus + " to " + newStatus + "."
            );
            notification.setType("STATUS_UPDATE");
            notification.setRead(false);
            notification.setCreatedAt(Instant.now());
            notificationRepository.save(notification);
        }
        return ResponseEntity.ok(Map.of("message", "Complaint updated successfully."));
    }
}