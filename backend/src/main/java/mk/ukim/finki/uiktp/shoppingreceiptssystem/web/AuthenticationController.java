package mk.ukim.finki.uiktp.shoppingreceiptssystem.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.AuthenticationResponse;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs.LoginRequest;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs.RegisterUserDTO;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.User;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl.AuthenticationService;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    public AuthenticationController(AuthenticationService authenticationService, JwtService jwtService) {
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterUserDTO request) {
        return ResponseEntity.ok(authenticationService.register(request));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(
                request.getEmail(),
                request.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh_token")
    public ResponseEntity refreshToken(
            HttpServletResponse response,
            HttpServletRequest request
    ) {
        return authenticationService.refreshToken(request, response);
    }
}