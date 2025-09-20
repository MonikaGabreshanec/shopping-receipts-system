package mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}