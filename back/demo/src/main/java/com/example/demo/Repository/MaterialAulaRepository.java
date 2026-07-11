package com.example.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.MaterialAula;

@Repository
public interface MaterialAulaRepository extends JpaRepository<MaterialAula, Long> {
    List<MaterialAula> findByDisciplinaAndTrimestreOrderByCriadoEmDesc(String disciplina, String trimestre);
    List<MaterialAula> findByDisciplinaOrderByCriadoEmDesc(String disciplina);
    List<MaterialAula> findByTrimestreOrderByCriadoEmDesc(String trimestre);
    List<MaterialAula> findAllByOrderByCriadoEmDesc();
}
