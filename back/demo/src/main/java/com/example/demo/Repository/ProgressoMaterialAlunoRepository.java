package com.example.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.ProgressoMaterialAluno;

@Repository
public interface ProgressoMaterialAlunoRepository extends JpaRepository<ProgressoMaterialAluno, Long> {
    List<ProgressoMaterialAluno> findByAlunoId(Long alunoId);

    Optional<ProgressoMaterialAluno> findByAlunoIdAndMaterialId(Long alunoId, Long materialId);
}