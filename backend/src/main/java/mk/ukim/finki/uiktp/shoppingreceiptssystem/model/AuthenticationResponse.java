package mk.ukim.finki.uiktp.shoppingreceiptssystem.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticationResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("message")
    private String message;

    @JsonProperty("name")
    private String name;

    @JsonProperty("surname")
    private String surname;

    public AuthenticationResponse(String accessToken, String refreshToken, String message, String name, String surname) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
        this.name = name;
        this.surname = surname;
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public String getMessage() { return message; }
    public String getName() { return name; }
    public String getSurname() { return surname; }
}
