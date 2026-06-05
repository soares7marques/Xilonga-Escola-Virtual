package com.example.demo.Service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.Exeception.ExceptionDadosDuplicado;
import com.example.demo.Repository.AdminRepository;
import com.example.demo.Repository.UtilizadorRepository;
import com.example.demo.model.Administrador;
import com.example.demo.model.Utilizador;


@Service
public class AdminService {
    
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final UtilizadorRepository utilizadorRepository;

    public AdminService(AdminRepository adminRepository,PasswordEncoder passwordEncoder,UtilizadorRepository utilizadorRepository){
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.utilizadorRepository = utilizadorRepository;
    }


    public ResponseEntity<?> SalveAdmin(Utilizador utilizador){  
        utilizadorRepository.findByEmail(utilizador.getEmail())
        .ifPresent((user)->{
            throw new ExceptionDadosDuplicado();
        });
        // Encriptar a senha antes de salvar
        String senhaEncriptada = passwordEncoder.encode(utilizador.getSenha());
        utilizador.setSenha(senhaEncriptada);
        utilizador.setRole("ADMIN"); // Definir a role padrão para o usuário

      utilizadorRepository.save(utilizador);

       Administrador admin = new Administrador();
        admin.setUtilizador(utilizador);
        admin.setCargo("Gestor");
        adminRepository.save(admin);
        // Montar resposta
        Map<String, Object> response = new HashMap<>();
        response.put("role", utilizador.getRole());
        response.put("id", utilizador.getId());
        response.put("success", true);
        return ResponseEntity.ok(response);
    } 
}
