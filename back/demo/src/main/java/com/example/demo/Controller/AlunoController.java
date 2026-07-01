
package com.example.demo.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Dto.DtoInscricao;
import com.example.demo.Dto.DtoProgressoMaterial;
import com.example.demo.Service.AlunoService;
import com.example.demo.model.Utilizador;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/aluno")
@RestController
public class AlunoController {
    
    private AlunoService alunoService;

    public AlunoController(AlunoService alunoService){
        this.alunoService = alunoService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAluno(@Valid @RequestBody Utilizador entity) {
        return ResponseEntity.ok().body(alunoService.SalveAluno(entity));
    }

    @PostMapping("/inscricao")
    public ResponseEntity<?> inscreverAluno(@RequestBody DtoInscricao dto) {
        return alunoService.inscricao(dto);
    }

    // Novo endpoint GET para retornar o perfil do aluno por email
    @GetMapping("/perfil")
    public ResponseEntity<?> getPerfilAluno(@RequestParam String email) {
        return ResponseEntity.ok(alunoService.getPerfilAlunoPorEmail(email));
    }

    @GetMapping("/progresso")
    public ResponseEntity<?> getResumoProgresso(@RequestParam String email) {
        return ResponseEntity.ok(alunoService.getResumoProgressoPorEmail(email));
    }

    @PostMapping("/progresso")
    public ResponseEntity<?> registrarProgresso(@RequestBody DtoProgressoMaterial dto) {
        return ResponseEntity.ok(alunoService.registrarProgressoMaterial(dto.getEmail(), dto.getMaterialId()));
    }

    // Endpoint GET para retornar o ranking dos alunos
    @GetMapping("/ranking")
    public ResponseEntity<?> getRankingAlunos() {
        return ResponseEntity.ok(alunoService.getRankingAlunos());
    }

    // Endpoint GET para retornar a quantidade total de alunos
    @GetMapping("/quantidade")
    public ResponseEntity<?> getQuantidadeAlunos() {
        return ResponseEntity.ok(alunoService.getQuantidadeAlunos());
    }
}
