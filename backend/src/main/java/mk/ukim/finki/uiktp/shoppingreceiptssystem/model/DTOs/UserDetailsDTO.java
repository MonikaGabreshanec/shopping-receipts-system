package mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs;

import lombok.Data;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.User;

@Data
public class UserDetailsDTO {

    public static UserDetailsDTO of(User user){
        UserDetailsDTO details = new UserDetailsDTO();
        return details;
    }
}