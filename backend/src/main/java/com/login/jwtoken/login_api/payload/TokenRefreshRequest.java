//DTO for refresh token request (likely just includes refresh token).
package com.login.jwtoken.login_api.payload;

public class TokenRefreshRequest {
    private String refreshToken;

    public TokenRefreshRequest() {}

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
