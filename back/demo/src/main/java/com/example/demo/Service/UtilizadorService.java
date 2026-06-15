
package com.example.demo.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.example.demo.Dto.DtoLogin;
import com.example.demo.Repository.UtilizadorRepository;
import com.example.demo.Security.JwtService;
import com.example.demo.model.Utilizador;

@Service
public class UtilizadorService {
    

    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public UtilizadorService(UtilizadorRepository utilizadorRepository, PasswordEncoder passwordEncoder, JwtService jwtService){
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

public ResponseEntity<?> login(DtoLogin request){
        
        Optional<Utilizador> utilizadorOpt = utilizadorRepository.findByEmail(request.getEmail());

         if (utilizadorOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email"));
            }
            
            Utilizador utilizador = utilizadorOpt.get();

            if (!passwordEncoder.matches(request.getSenha(), utilizador.getSenha())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email ou senha incorretos"));
            }
               
           DtoLogin dto = new DtoLogin();
            String token = jwtService.gerarToken(utilizador);
            dto.setRole(utilizador.getRole());
            dto.setEmail(utilizador.getEmail());
            dto.setToken(token);
            dto.setTokenType("Bearer");
            dto.setExpiresAt(System.currentTimeMillis() + jwtService.getExpirationMs());
            dto.setSuccess(true);
            return ResponseEntity.ok(dto);
    }
}
