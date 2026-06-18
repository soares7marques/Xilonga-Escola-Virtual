package com.example.demo.Service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.SemestreRepository;
import com.example.demo.model.Semestre;

@Service
public class SemestreService {

    private static final long LIMITE_SEMESTRES = 3;

    private final SemestreRepository semestreRepository;

    public SemestreService(SemestreRepository semestreRepository) {
        this.semestreRepository = semestreRepository;
    }

    public ResponseEntity<?> criarSemestre(Semestre semestre) {
        String nome = normalizar(semestre.getNome());
        if (nome.isEmpty()) {
            throw new IllegalArgumentException("Informe o nome do semestre.");
        }

        semestreRepository.findByNome(nome).ifPresent(item -> {
            throw new IllegalArgumentException("Semestre já cadastrado.");
        });

        if (semestreRepository.count() >= LIMITE_SEMESTRES) {
            throw new IllegalArgumentException("Só é possível cadastrar até 3 semestres.");
        }

        Semestre novoSemestre = new Semestre();
        novoSemestre.setNome(nome);
        semestreRepository.save(novoSemestre);
        return ResponseEntity.ok("Semestre cadastrado com sucesso.");
    }

    public List<Semestre> listarSemestres() {
        return semestreRepository.findAll();
    }

    public boolean existeSemestre(String nome) {
        return semestreRepository.findByNome(normalizar(nome)).isPresent();
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
