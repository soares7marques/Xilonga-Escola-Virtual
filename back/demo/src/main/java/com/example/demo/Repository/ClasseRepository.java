package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Classe;

@Repository
public interface ClasseRepository extends JpaRepository<Classe,Long>{
	Optional<Classe> findByNome(String nome);
}
