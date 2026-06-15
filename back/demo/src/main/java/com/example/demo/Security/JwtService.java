package com.example.demo.Security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.demo.model.Utilizador;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${app.jwt.secret:xilonga-secret-key-jwt-precisa-ter-mais-de-32-caracteres}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public String gerarToken(Utilizador utilizador) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", utilizador.getRole());
        claims.put("id", utilizador.getId());
        claims.put("nome", utilizador.getNome());
        return gerarToken(claims, utilizador.getEmail());
    }

    public String extrairEmail(String token) {
        return extrairTodasClaims(token).getSubject();
    }

    public Date extrairExpiracao(String token) {
        return extrairTodasClaims(token).getExpiration();
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public boolean tokenValido(String token, UserDetails userDetails) {
        String email = extrairEmail(token);
        return email.equals(userDetails.getUsername()) && !tokenExpirado(token);
    }

    private String gerarToken(Map<String, Object> claims, String subject) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expirationMs);

        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(agora)
            .expiration(expiracao)
            .signWith(getSigningKey())
            .compact();
    }

    private boolean tokenExpirado(String token) {
        return extrairExpiracao(token).before(new Date());
    }

    private Claims extrairTodasClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
