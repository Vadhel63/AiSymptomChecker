package Milan.Ai_sypmtom.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
@Service
public class TokenService {
    private  final JwtEncoder encoder;
    private  final JwtDecoder decoder;

    public TokenService(JwtEncoder encoder, JwtDecoder decoder) {
        this.encoder = encoder;
        this.decoder = decoder;
    }
    public String generateToken(Authentication auth) {
        Instant now = Instant.now();
        String email = auth.getName();
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(email)
                .claim("role", role)
                .build();
        return encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
    public boolean validateToken(String token) {
        try {
            Jwt decodedToken = decoder.decode(token);
            return decodedToken.getExpiresAt().isAfter(Instant.now());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    }

