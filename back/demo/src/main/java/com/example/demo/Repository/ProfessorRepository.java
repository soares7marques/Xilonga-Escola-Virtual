package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Professor;
import com.example.demo.model.Utilizador;

import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor,Long>{
    Optional<Professor> findByUtilizador(Utilizador utilizador);
}
