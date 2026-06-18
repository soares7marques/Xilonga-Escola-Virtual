package com.example.demo.Controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.Service.MaterialAulaService;
import com.example.demo.Service.ProfessorService;
import com.example.demo.Service.SemestreService;
import com.example.demo.model.MaterialAula;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/professor")
@RestController

public class ProfessorController {

    private final MaterialAulaService materialAulaService;
    private final ProfessorService professorService;
    private final SemestreService semestreService;

    public ProfessorController(MaterialAulaService materialAulaService, ProfessorService professorService, SemestreService semestreService) {
        this.materialAulaService = materialAulaService;
        this.professorService = professorService;
        this.semestreService = semestreService;
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(Principal principal) {
        return ResponseEntity.ok(professorService.getPerfilPorEmail(principal.getName()));
    }

    @GetMapping("/semestres")
    public ResponseEntity<?> listarSemestres() {
        return ResponseEntity.ok(semestreService.listarSemestres());
    }

    @PostMapping(value = "/materiais", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criarMaterial(
        @RequestParam(required = false) String classe,
        @RequestParam(required = false) String disciplina,
        @RequestParam String semestre,
        @RequestParam String titulo,
        @RequestParam(required = false) MultipartFile video,
        Principal principal
    ) {
        Map<String, Object> perfil = professorService.getPerfilPorEmail(principal.getName());
        return ResponseEntity.ok(materialAulaService.criarMaterial(
            (String) perfil.get("classe"),
            (String) perfil.get("disciplina"),
            semestre,
            titulo,
            video,
            principal
        ));
    }

    @GetMapping("/materiais")
    public ResponseEntity<?> listarMateriais(
        @RequestParam(required = false) String disciplina,
        @RequestParam(required = false) String semestre
    ) {
        return ResponseEntity.ok(materialAulaService.listarMateriais(disciplina, semestre));
    }

    @GetMapping("/materiais/{id}/video")
    public ResponseEntity<Resource> verVideo(@PathVariable Long id) {
        MaterialAula material = materialAulaService.buscarMaterial(id);
        Resource video = materialAulaService.carregarVideo(id);
        String contentType = material.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : material.getContentType();

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + material.getNomeArquivo() + "\"")
            .body(video);
    }

}
