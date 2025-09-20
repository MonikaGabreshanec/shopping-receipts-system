package mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs;

import lombok.Data;

@Data
public class RegisterUserDTO {
    private String name;
    private String surname;
    private String email;
    private String password;
}