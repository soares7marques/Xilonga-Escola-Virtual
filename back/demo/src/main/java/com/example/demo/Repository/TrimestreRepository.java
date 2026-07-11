package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Trimestre;

@Repository
public interface TrimestreRepository extends JpaRepository<Trimestre, Long> {
    Optional<Trimestre> findByNome(String nome);
}
