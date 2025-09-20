package mk.ukim.finki.uiktp.shoppingreceiptssystem.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.AuthenticationResponse;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.DTOs.RegisterUserDTO;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.Token;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.model.User;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.TokenRepository;
import mk.ukim.finki.uiktp.shoppingreceiptssystem.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponse register(RegisterUserDTO request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthenticationResponse(null, null, "User already exists", null, null);
        }

        User user = new User(
                request.getName(),
                request.getSurname(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        user = repository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        saveUserToken(accessToken, refreshToken, user);

        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                "Registration successful",
                user.getName(),
                user.getSurname()
        );
    }

    public AuthenticationResponse authenticate(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllTokenByUser(user);
        saveUserToken(accessToken, refreshToken, user);

        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                "Login successful",
                user.getName(),
                user.getSurname()
        );
    }

    private void revokeAllTokenByUser(User user){
        List<Token> validTokens = tokenRepository.findAllAccessTokensByUser(user.getId());
        if(validTokens.isEmpty()){
            return;
        }
        validTokens.forEach(t-> t.setLoggedOut(true));
        tokenRepository.saveAll(validTokens);
    }

    private void saveUserToken(String accessToken, String refreshToken, User user){
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setLoggedOut(false);
        token.setUser(user);
        tokenRepository.save(token);
    }

    public ResponseEntity refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ){
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found"));

        if (jwtService.isValidRefreshToken(token, user)){
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            revokeAllTokenByUser(user);
            saveUserToken(accessToken, refreshToken, user);

            return new ResponseEntity<>(
                    new AuthenticationResponse(
                            accessToken,
                            refreshToken,
                            "New token generated",
                            user.getName(),
                            user.getSurname()
                    ),
                    HttpStatus.OK
            );
        }

        return new ResponseEntity(HttpStatus.UNAUTHORIZED);
    }
}
