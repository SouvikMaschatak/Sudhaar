package com.login.jwtoken.login_api.payload;

public class TokenResponse {
    private String accessToken;   // ← renamed from "token"
    private String refreshToken;

    public TokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;   // ← fixed
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() { return accessToken; }        // ← renamed
    public void setAccessToken(String v) { this.accessToken = v; } // ← renamed

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String v) { this.refreshToken = v; }
}