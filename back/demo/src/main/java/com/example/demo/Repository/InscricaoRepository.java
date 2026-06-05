package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Inscricao;

public interface InscricaoRepository extends JpaRepository<Inscricao,Long> {
    Inscricao findByIdAlunoAndIdClasse(Long idAluno, Long idArea);
}
