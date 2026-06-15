package com.example.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.MaterialAula;

@Repository
public interface MaterialAulaRepository extends JpaRepository<MaterialAula, Long> {
    List<MaterialAula> findByDisciplinaAndSemestreOrderByCriadoEmDesc(String disciplina, String semestre);
    List<MaterialAula> findByDisciplinaOrderByCriadoEmDesc(String disciplina);
    List<MaterialAula> findBySemestreOrderByCriadoEmDesc(String semestre);
    List<MaterialAula> findAllByOrderByCriadoEmDesc();
}
