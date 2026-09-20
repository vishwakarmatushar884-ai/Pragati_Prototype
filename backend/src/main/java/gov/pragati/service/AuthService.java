package gov.pragati.service;

import gov.pragati.dto.AuthDTOs;
import gov.pragati.entity.AuditAction;
import gov.pragati.entity.User;
import gov.pragati.exception.BadRequestException;
import gov.pragati.repository.UserRepository;
import gov.pragati.security.JwtTokenProvider;
import gov.pragati.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtTokenProvider tokenProvider,
                       AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.auditService = auditService;
    }

    public AuthDTOs.JwtResponse login(AuthDTOs.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            User user = userRepository.findByEmail(userPrincipal.getUsername()).orElse(null);
            if (user != null) {
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);
            }

            List<String> roles = userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            auditService.logAction(AuditAction.LOGIN, "User", userPrincipal.getId(), userPrincipal.getUsername(),
                    null, null, "User logged in successfully");

            return new AuthDTOs.JwtResponse(
                    jwt,
                    userPrincipal.getId(),
                    userPrincipal.getUsername(),
                    userPrincipal.getFullName(),
                    userPrincipal.getDesignation(),
                    userPrincipal.getMinistry(),
                    userPrincipal.getDepartment(),
                    roles
            );
        } catch (Exception e) {
            throw new BadRequestException("Invalid email or password credentials");
        }
    }

    public AuthDTOs.UserDTO getCurrentUser(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        AuthDTOs.UserDTO dto = new AuthDTOs.UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setDesignation(user.getDesignation());
        dto.setMinistry(user.getMinistry());
        dto.setDepartment(user.getDepartment());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setEnabled(user.isEnabled());
        dto.setRoles(user.getRoles().stream().map(r -> "ROLE_" + r.getName().name()).collect(Collectors.toList()));
        return dto;
    }
}
