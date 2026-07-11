package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;
import com.example.demo.model.Professor;
import com.example.demo.model.Utilizador;

import java.util.Optional;
import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor,Long>{
    List<Professor> findByUtilizador(Utilizador utilizador);
    Optional<Professor> findFirstByUtilizador(Utilizador utilizador);
    boolean existsByUtilizadorAndClasseAndDisciplina(Utilizador utilizador, Classe classe, Disciplina disciplina);
}
