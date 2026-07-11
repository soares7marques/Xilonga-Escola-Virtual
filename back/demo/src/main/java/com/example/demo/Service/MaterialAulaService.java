package com.example.demo.Service;

import java.io.IOException;
import java.text.Normalizer;
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

import com.example.demo.Repository.MaterialAulaRepository;
import com.example.demo.model.MaterialAula;

@Service
public class MaterialAulaService {

    private static final long TAMANHO_MAXIMO_VIDEO = 30 * 1024 * 1024; // 30 MB

    private final MaterialAulaRepository materialAulaRepository;
    private final TrimestreService trimestreService;
    private final Path aulasDir;

    public MaterialAulaService(
        MaterialAulaRepository materialAulaRepository,
        TrimestreService trimestreService,
        @Value("${app.upload.aulas-dir:uploads/aulas}") String aulasDir
    ) {
        this.materialAulaRepository = materialAulaRepository;
        this.trimestreService = trimestreService;
        this.aulasDir = resolverAulasDir(aulasDir);
    }

    public MaterialAula criarMaterial(
        String classe,
        String disciplina,
        String trimestre,
        String titulo,
        MultipartFile video,
        Principal principal
    ) {
        MaterialAula material = new MaterialAula();
        material.setClasse(normalizar(classe));
        material.setDisciplina(normalizar(disciplina));
        material.setTrimestre(normalizar(trimestre));
        material.setTitulo(normalizar(titulo));
        material.setProfessorEmail(getEmail(principal));

        if (!trimestreService.existeTrimestre(material.getTrimestre())) {
            throw new IllegalArgumentException("Trimestre não cadastrado.");
        }

        if (video != null && !video.isEmpty()) {
            if (video.getSize() > TAMANHO_MAXIMO_VIDEO) {
                throw new IllegalArgumentException("O vídeo deve ter no máximo 30 MB.");
            }

            String contentType = video.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                throw new IllegalArgumentException("Envie apenas ficheiros de vídeo.");
            }

            String nomeOriginal = video.getOriginalFilename();
            if (nomeOriginal == null || nomeOriginal.isBlank()) {
                nomeOriginal = "video";
            }
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
            material.setContentType(contentType);
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

        if (!temValor(material.getCaminhoArquivo()) && !temValor(material.getNomeArquivoSalvo())) {
            throw new RuntimeException("Material sem vídeo cadastrado");
        }

        for (Path caminho : caminhosPossiveis(material)) {
            try {
                Resource resource = new UrlResource(caminho.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            } catch (IOException e) {
                throw new RuntimeException("Não foi possível carregar o vídeo.", e);
            }
        }

        throw new RuntimeException("Vídeo não encontrado no servidor. Verifique se o arquivo existe em " + aulasDir);
    }

    public List<MaterialAula> listarMateriais(String disciplina, String trimestre) {
        boolean temDisciplina = temValor(disciplina);
        boolean temTrimestre = temValor(trimestre);
        String disciplinaNormalizada = normalizarComparacao(disciplina);
        String trimestreNormalizado = normalizarComparacao(trimestre);

        if (temDisciplina && temTrimestre) {
            return materialAulaRepository.findAll().stream()
                .filter(material -> normalizarComparacao(material.getDisciplina()).equals(disciplinaNormalizada))
                .filter(material -> normalizarComparacao(material.getTrimestre()).equals(trimestreNormalizado))
                .sorted((a, b) -> b.getCriadoEm().compareTo(a.getCriadoEm()))
                .toList();
        }

        if (temDisciplina) {
            return materialAulaRepository.findAll().stream()
                .filter(material -> normalizarComparacao(material.getDisciplina()).equals(disciplinaNormalizada))
                .sorted((a, b) -> b.getCriadoEm().compareTo(a.getCriadoEm()))
                .toList();
        }

        if (temTrimestre) {
            return materialAulaRepository.findAll().stream()
                .filter(material -> normalizarComparacao(material.getTrimestre()).equals(trimestreNormalizado))
                .sorted((a, b) -> b.getCriadoEm().compareTo(a.getCriadoEm()))
                .toList();
        }

        return materialAulaRepository.findAllByOrderByCriadoEmDesc();
    }

    private String getEmail(Principal principal) {
        return principal == null ? "" : principal.getName();
    }

    private boolean temValor(String valor) {
        return valor != null && !valor.trim().isEmpty();
    }

    private List<Path> caminhosPossiveis(MaterialAula material) {
        List<Path> caminhos = new java.util.ArrayList<>();

        if (temValor(material.getCaminhoArquivo())) {
            caminhos.add(Paths.get(material.getCaminhoArquivo()).toAbsolutePath().normalize());
        }

        if (temValor(material.getNomeArquivoSalvo())) {
            caminhos.add(aulasDir.resolve(material.getNomeArquivoSalvo()).toAbsolutePath().normalize());
        }

        return caminhos.stream().distinct().toList();
    }

    private Path resolverAulasDir(String aulasDirConfigurado) {
        Path configurado = Paths.get(aulasDirConfigurado).toAbsolutePath().normalize();

        if (configurado.isAbsolute() && Files.exists(configurado)) {
            return configurado;
        }

        Path naRaizDoProjeto = Paths.get("..").resolve(aulasDirConfigurado).toAbsolutePath().normalize();
        if (Files.exists(naRaizDoProjeto)) {
            return naRaizDoProjeto;
        }

        String userDir = Paths.get("").toAbsolutePath().normalize().toString();
        if (userDir.endsWith("back/demo") || userDir.endsWith("back\\demo")) {
            return naRaizDoProjeto;
        }

        return configurado;
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String normalizarComparacao(String valor) {
        if (valor == null) {
            return "";
        }

        return Normalizer.normalize(valor.trim()
            .toLowerCase()
            .replace('º', 'o')
            .replace('ª', 'a')
            .replaceAll("\\s+", " ")
            , Normalizer.Form.NFD).replaceAll("[\\p{M}]", "");
    }
}
