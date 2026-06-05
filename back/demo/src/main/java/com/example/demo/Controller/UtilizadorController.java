
package com.example.demo.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.Dto.DtoLogin;
import com.example.demo.Service.UtilizadorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/utilizador")
@RestController

public class UtilizadorController {
    
    private UtilizadorService utilizadorService;

    public UtilizadorController(UtilizadorService utilizadorService){
        this.utilizadorService = utilizadorService;
    }

    @PostMapping("login")
    public ResponseEntity<?> login(@Valid @RequestBody DtoLogin entity) {
        
    try {
            // Removido log de email e senha recebidos   
            return utilizadorService.login(entity);
            
        } catch (Exception e) {
            // Removido log de erro e stacktrace    
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Erro interno: " + e.getMessage()));
        }
    }
    

}
