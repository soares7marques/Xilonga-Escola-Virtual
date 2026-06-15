package com.example.demo.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.Dto.DtoProva;
import com.example.demo.Repository.MaterialAulaRepository;
import com.example.demo.Repository.ProvaRepository;
import com.example.demo.model.MaterialAula;
import com.example.demo.model.Prova;

@Service
public class MaterialAulaService {

    private final MaterialAulaRepository materialAulaRepository;
    private final ProvaRepository provaRepository;
    private final Path aulasDir;

    public MaterialAulaService(
        MaterialAulaRepository materialAulaRepository,
        ProvaRepository provaRepository,
        @Value("${app.upload.aulas-dir:uploads/aulas}") String aulasDir
    ) {
        this.materialAulaRepository = materialAulaRepository;
        this.provaRepository = provaRepository;
        this.aulasDir = Paths.get(aulasDir).toAbsolutePath().normalize();
    }

    public MaterialAula criarMaterial(
        String classe,
        String disciplina,
        String semestre,
        String titulo,
        MultipartFile video,
        Principal principal
    ) {
        MaterialAula material = new MaterialAula();
        material.setClasse(normalizar(classe));
        material.setDisciplina(normalizar(disciplina));
        material.setSemestre(normalizar(semestre));
        material.setTitulo(normalizar(titulo));
        material.setProfessorEmail(getEmail(principal));

        if (video != null && !video.isEmpty()) {
            String nomeOriginal = video.getOriginalFilename() == null ? "video" : video.getOriginalFilename();
            String nomeSalvo = UUID.randomUUID() + "-" + nomeOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path destino = aulasDir.resolve(nomeSalvo).normalize();

            try {
                Files.createDirectories(aulasDir);
                video.transferTo(destino);
            } catch (IOException e) {
                throw new RuntimeException("Não foi possível salvar o vídeo.", e);
            }

            material.setNomeArquivo(video.getOriginalFilename());
            material.setNomeArquivoSalvo(nomeSalvo);
            material.setCaminhoArquivo(destino.toString());
            material.setContentType(video.getContentType());
            material.setTamanhoArquivo(video.getSize());
        }

        return materialAulaRepository.save(material);
    }

    public MaterialAula buscarMaterial(Long id) {
        return materialAulaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Material não encontrado"));
    }

    public Resource carregarVideo(Long id) {
        MaterialAula material = buscarMaterial(id);

        if (!temValor(material.getCaminhoArquivo())) {
            throw new RuntimeException("Material sem vídeo cadastrado");
        }

        try {
            Resource resource = new UrlResource(Paths.get(material.getCaminhoArquivo()).toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível carregar o vídeo.", e);
        }

        throw new RuntimeException("Vídeo não encontrado no servidor");
    }

    public List<MaterialAula> listarMateriais(String disciplina, String semestre) {
        boolean temDisciplina = temValor(disciplina);
        boolean temSemestre = temValor(semestre);

        if (temDisciplina && temSemestre) {
            return materialAulaRepository.findByDisciplinaAndSemestreOrderByCriadoEmDesc(disciplina.trim(), semestre.trim());
        }

        if (temDisciplina) {
            return materialAulaRepository.findByDisciplinaOrderByCriadoEmDesc(disciplina.trim());
        }

        if (temSemestre) {
            return materialAulaRepository.findBySemestreOrderByCriadoEmDesc(semestre.trim());
        }

        return materialAulaRepository.findAllByOrderByCriadoEmDesc();
    }

    public Prova criarProva(DtoProva request, Principal principal) {
        Prova prova = new Prova();
        prova.setClasse(normalizar(request.getClasse()));
        prova.setDisciplina(normalizar(request.getDisciplina()));
        prova.setSemestre(normalizar(request.getSemestre()));
        prova.setTitulo(normalizar(request.getTitulo()));
        prova.setDescricao(normalizar(request.getDescricao()));
        prova.setPerguntas(normalizar(request.getPerguntas()));
        prova.setProfessorEmail(getEmail(principal));
        return provaRepository.save(prova);
    }

    public List<Prova> listarProvas(String disciplina, String semestre) {
        boolean temDisciplina = temValor(disciplina);
        boolean temSemestre = temValor(semestre);

        if (temDisciplina && temSemestre) {
            return provaRepository.findByDisciplinaAndSemestreOrderByCriadoEmDesc(disciplina.trim(), semestre.trim());
        }

        if (temDisciplina) {
            return provaRepository.findByDisciplinaOrderByCriadoEmDesc(disciplina.trim());
        }

        if (temSemestre) {
            return provaRepository.findBySemestreOrderByCriadoEmDesc(semestre.trim());
        }

        return provaRepository.findAllByOrderByCriadoEmDesc();
    }

    private String getEmail(Principal principal) {
        return principal == null ? "" : principal.getName();
    }

    private boolean temValor(String valor) {
        return valor != null && !valor.trim().isEmpty();
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
