package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Semestre;

@Repository
public interface SemestreRepository extends JpaRepository<Semestre, Long> {
    Optional<Semestre> findByNome(String nome);
}
