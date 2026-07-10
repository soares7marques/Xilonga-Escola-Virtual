package com.example.demo.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Service.UtilizadorService;
import com.example.demo.Dto.DtoChangePassword;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/auth")
@RestController
public class AuthController {

    private final UtilizadorService utilizadorService;

    public AuthController(UtilizadorService utilizadorService) {
        this.utilizadorService = utilizadorService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody DtoChangePassword dto) {
        if (dto == null || dto.getEmail() == null || dto.getSenha() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email e senha são obrigatórios"));
        }

        return utilizadorService.changePassword(dto.getEmail(), dto.getSenha());
    }
}
