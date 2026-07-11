package com.example.demo.Service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.TrimestreRepository;
import com.example.demo.model.Trimestre;

@Service
public class TrimestreService {

    private static final long LIMITE_TRIMESTRES = 3;

    private final TrimestreRepository trimestreRepository;

    public TrimestreService(TrimestreRepository trimestreRepository) {
        this.trimestreRepository = trimestreRepository;
    }

    public ResponseEntity<?> criarTrimestre(Trimestre trimestre) {
        String nome = normalizar(trimestre.getNome());
        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Informe o nome do trimestre.");
        }

        trimestreRepository.findByNome(nome).ifPresent(item -> {
            throw new IllegalArgumentException("Trimestre já cadastrado.");
        });

        if (trimestreRepository.count() >= LIMITE_TRIMESTRES) {
            throw new IllegalArgumentException("Só é possível cadastrar até 3 trimestres.");
        }

        Trimestre novoTrimestre = new Trimestre();
        novoTrimestre.setNome(nome);
        trimestreRepository.save(novoTrimestre);
        return ResponseEntity.ok("Trimestre cadastrado com sucesso.");
    }

    public List<Trimestre> listarTrimestres() {
        return trimestreRepository.findAll();
    }

    public boolean existeTrimestre(String nome) {
        return trimestreRepository.findByNome(normalizar(nome)).isPresent();
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
