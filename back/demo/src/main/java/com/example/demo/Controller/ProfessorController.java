package com.example.demo.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.Service.MaterialAulaService;
import com.example.demo.Service.ProfessorService;
import com.example.demo.Service.TrimestreService;
import com.example.demo.model.MaterialAula;

@RequestMapping("/professor")
@RestController

public class ProfessorController {

    private final MaterialAulaService materialAulaService;
    private final ProfessorService professorService;
    private final TrimestreService trimestreService;

    public ProfessorController(MaterialAulaService materialAulaService, ProfessorService professorService, TrimestreService trimestreService) {
        this.materialAulaService = materialAulaService;
        this.professorService = professorService;
        this.trimestreService = trimestreService;
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> perfil(Principal principal) {
        return ResponseEntity.ok(professorService.getPerfilPorEmail(principal.getName()));
    }

    @GetMapping("/alunos")
    public ResponseEntity<?> listarAlunosDaClasse(
        Principal principal,
        @RequestParam(required = false) String classe
    ) {
        return ResponseEntity.ok(professorService.listarAlunosDaClasseDoProfessor(principal.getName(), classe));
    }

    @GetMapping({"/trimestres", "/semestres"})
    public ResponseEntity<?> listarTrimestres() {
        return ResponseEntity.ok(trimestreService.listarTrimestres());
    }

    @PostMapping(value = "/materiais", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> criarMaterial(
        @RequestParam(required = false) String classe,
        @RequestParam(required = false) String disciplina,
        @RequestParam(required = false) String trimestre,
        @RequestParam(required = false) String semestre,
        @RequestParam String titulo,
        @RequestParam(required = false) MultipartFile video,
        Principal principal
    ) {
        Map<String, Object> perfil = professorService.getPerfilPorEmail(principal.getName());
        String classeSelecionada = classe == null || classe.isBlank() ? (String) perfil.get("classe") : classe;
        String disciplinaSelecionada = disciplina == null || disciplina.isBlank() ? (String) perfil.get("disciplina") : disciplina;

        if (!professorService.professorTemAssociacao(principal.getName(), classeSelecionada, disciplinaSelecionada)) {
            return ResponseEntity.badRequest().body("Professor não está associado a esta classe e disciplina.");
        }

        return ResponseEntity.ok(materialAulaService.criarMaterial(
            classeSelecionada,
            disciplinaSelecionada,
            trimestre == null || trimestre.isBlank() ? semestre : trimestre,
            titulo,
            video,
            principal
        ));
    }

    @GetMapping("/materiais")
    public ResponseEntity<?> listarMateriais(
        @RequestParam(required = false) String disciplina,
        @RequestParam(required = false) String trimestre,
        @RequestParam(required = false) String semestre
    ) {
        return ResponseEntity.ok(materialAulaService.listarMateriais(
            disciplina,
            trimestre == null || trimestre.isBlank() ? semestre : trimestre
        ));
    }

    @GetMapping("/materiais/{id}/video")
    public ResponseEntity<?> verVideo(@PathVariable Long id, @RequestHeader HttpHeaders headers) {
        MaterialAula material;
        Resource video;

        try {
            material = materialAulaService.buscarMaterial(id);
            video = materialAulaService.carregarVideo(id);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }

        String contentType = material.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : material.getContentType();
        MediaType mediaType = MediaType.parseMediaType(contentType);

        List<HttpRange> ranges = headers.getRange();
        if (ranges != null && !ranges.isEmpty()) {
            ResourceRegion region = ranges.get(0).toResourceRegion(video);
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .contentType(mediaType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + material.getNomeArquivo() + "\"")
                .body(region);
        }

        long tamanho = material.getTamanhoArquivo() == null ? -1 : material.getTamanhoArquivo();
        if (tamanho < 0) {
            try {
                tamanho = video.contentLength();
            } catch (Exception ignored) {
                tamanho = -1;
            }
        }

        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.ACCEPT_RANGES, "bytes")
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + material.getNomeArquivo() + "\"");

        if (tamanho >= 0) {
            response.contentLength(tamanho);
        }

        return response.body(video);
    }

}
