package com.login.jwtoken.login_api.controller;

import com.login.jwtoken.login_api.model.municipality;
import com.login.jwtoken.login_api.model.RefreshToken;
import com.login.jwtoken.login_api.payload.TokenResponse;
import com.login.jwtoken.login_api.repository.MunicipalityRepository;
import com.login.jwtoken.login_api.security.JwtUtils;
import com.login.jwtoken.login_api.security.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.Year;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/municipality")
public class MunicipalityController {

    @Autowired
    private MunicipalityRepository municipalityRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    // ── Generate Municipality ID ───────────────────────
    // Format: MUN-{STATE_PREFIX}-{YEAR}-{SEQUENCE}
    // Example: MUN-WB-2026-0001
    private String generateMunicipalityId(String state) {
        // Take first 2 letters of state, uppercase
        String statePrefix = state.trim().substring(0, Math.min(2, state.trim().length())).toUpperCase();
        int year = Year.now().getValue();
        String prefix = "MUN-" + statePrefix + "-" + year + "-";

        // Count existing municipalities with this prefix to get next sequence
        long count = municipalityRepository.countByMunicipalityIdStartingWith(prefix);
        String sequence = String.format("%04d", count + 1); // 0001, 0002...

        return prefix + sequence;
    }

    // ── Signup ─────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String corporationCode = body.get("corporationCode");

        // Check if corporation code already registered
        if (municipalityRepository.findByCorporationCode(corporationCode).isPresent()) {
            return ResponseEntity.badRequest().body("Corporation code already registered.");
        }

        // Build and save municipality
        municipality municipality = new municipality();
        municipality.setCorporationName(body.get("corporationName"));
        municipality.setCorporationCode(corporationCode);
        municipality.setAddress(body.get("address"));
        municipality.setState(body.get("state"));
        municipality.setEmail(body.get("email"));
        municipality.setPhone(body.get("phone"));
        municipality.setPassword(body.get("password"));

        // Generate and assign unique Municipality ID
        String municipalityId = generateMunicipalityId(body.get("state"));
        municipality.setMunicipalityId(municipalityId);

        municipalityRepository.save(municipality);

        // Return the generated ID to frontend
        return ResponseEntity.ok(Map.of("municipalityId", municipalityId));
    }

    // ── Signin ─────────────────────────────────────────
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> body) {
        String municipalityId = body.get("municipalityId");
        String password       = body.get("password");

        municipality municipality = municipalityRepository.findByMunicipalityId(municipalityId).orElse(null);

        if (municipality == null || !municipality.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Municipality ID or password.");
        }   

        UserDetails userDetails = User.withUsername(municipalityId)
            .password(password)
            .authorities(Collections.emptyList())
            .build();

        String jwt = jwtUtils.generateJwtToken(userDetails);

        // NEW: pass ownerId and ownerType
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(municipality.getId(), "MUNICIPALITY");

        return ResponseEntity.ok(new TokenResponse(jwt, refreshToken.getToken()));
    }

    // ── GET municipality profile ───────────────────────────────
    // Protected — requires valid JWT token
    @GetMapping("/profile/{municipalityId}")
    public ResponseEntity<?> getProfile(@PathVariable String municipalityId) {
        municipality municipality = municipalityRepository.findByMunicipalityId(municipalityId).orElse(null);
        if (municipality == null) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Municipality not found.");
        }
        // Return only safe fields — never return password
        return ResponseEntity.ok(Map.of(
            "corporationName", municipality.getCorporationName(),
            "municipalityId",  municipality.getMunicipalityId(),
            "address",         municipality.getAddress()  != null ? municipality.getAddress()  : "",
            "state",           municipality.getState()    != null ? municipality.getState()    : "",
            "email",           municipality.getEmail()    != null ? municipality.getEmail()    : "",
            "phone",           municipality.getPhone()    != null ? municipality.getPhone()    : ""
        ));
    }
}