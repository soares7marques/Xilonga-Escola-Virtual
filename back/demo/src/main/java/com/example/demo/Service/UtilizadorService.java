
package com.example.demo.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import com.example.demo.Dto.DtoLogin;
import com.example.demo.Repository.UtilizadorRepository;
import com.example.demo.model.Utilizador;

@Service
public class UtilizadorService {
    

    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;


    public UtilizadorService(UtilizadorRepository utilizadorRepository, PasswordEncoder passwordEncoder){
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
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
            dto.setRole(utilizador.getRole());
            dto.setEmail(utilizador.getEmail());
            dto.setSuccess(true);
            return ResponseEntity.ok(dto);
    }
}
