// Utility class for creating, validating, and parsing JWTs.
package com.login.jwtoken.login_api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.io.Decoders;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;                   //Injects the JWT secret key from application properties (used to sign tokens).

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;                //Injects the JWT expiration time (in milliseconds) from application properties.

    //Converts the secret key string into a Key object for HMAC-SHA signing.
    //Hash-based Message Authentication Code using SHA (Secure Hash Algorithm).
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(org.springframework.security.core.userdetails.UserDetails userDetails) {                 //Generates a JWT token
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    //Parses a JWT token to extract the username (subject) claim.
    //Validates signature using the signing key.
    //Returns the subject claim from token payload.
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {             //verifies the jwtoken
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log the exception
        }
        return false;
    }
}