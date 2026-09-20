package gov.pragati.controller;

import gov.pragati.dto.AuthDTOs;
import gov.pragati.security.UserPrincipal;
import gov.pragati.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and profile management APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and obtain JWT token")
    public ResponseEntity<AuthDTOs.JwtResponse> login(@Valid @RequestBody AuthDTOs.LoginRequest loginRequest) {
        AuthDTOs.JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<AuthDTOs.UserDTO> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        AuthDTOs.UserDTO userDTO = authService.getCurrentUser(userPrincipal);
        return ResponseEntity.ok(userDTO);
    }
}
