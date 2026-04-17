package com.login.jwtoken.login_api.controller;

import com.login.jwtoken.login_api.model.resident;
import com.login.jwtoken.login_api.model.RefreshToken;
import com.login.jwtoken.login_api.payload.TokenResponse;
import com.login.jwtoken.login_api.repository.ResidentRepository;
import com.login.jwtoken.login_api.security.JwtUtils;
import com.login.jwtoken.login_api.security.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/resident")
public class ResidentController {
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody Map<String, String> body) {
        String phone    = body.get("phone");
        String password = body.get("password");
        String name     = body.get("name");
        String address  = body.get("address");
        if (residentRepository.findByPhone(phone).isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already registered.");
        }
        resident resident = new resident(phone, password);
        resident.setName(name);
        resident.setAddress(address);
        residentRepository.save(resident);
        return ResponseEntity.ok("Resident registered successfully!");
    }
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> body) {
        String phone    = body.get("phone");
        String password = body.get("password");

        resident resident = residentRepository.findByPhone(phone).orElse(null);

        if (resident == null || !resident.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid phone number or password.");
        }
        UserDetails userDetails = User.withUsername(phone)
            .password(password)
            .authorities(Collections.emptyList())
            .build();
        String jwt = jwtUtils.generateJwtToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
            resident.getId(), "RESIDENT");
        return ResponseEntity.ok(new TokenResponse(jwt, refreshToken.getToken()));
    }
// Protected — requires valid JWT token
    @GetMapping("/profile/{phone}")
    public ResponseEntity<?> getProfile(@PathVariable String phone) {
        resident resident = residentRepository.findByPhone(phone).orElse(null);
        if (resident == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body("Resident not found.");
        }
        // Return only safe fields — never return password
        return ResponseEntity.ok(Map.of(
            "name",    resident.getName()    != null ? resident.getName()    : "",
            "phone",   resident.getPhone(),
            "address", resident.getAddress() != null ? resident.getAddress() : ""
        ));
    }
}