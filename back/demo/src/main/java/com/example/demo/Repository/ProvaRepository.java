package com.example.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Prova;

@Repository
public interface ProvaRepository extends JpaRepository<Prova, Long> {
    List<Prova> findByDisciplinaAndSemestreOrderByCriadoEmDesc(String disciplina, String semestre);
    List<Prova> findByDisciplinaOrderByCriadoEmDesc(String disciplina);
    List<Prova> findBySemestreOrderByCriadoEmDesc(String semestre);
    List<Prova> findAllByOrderByCriadoEmDesc();
}
