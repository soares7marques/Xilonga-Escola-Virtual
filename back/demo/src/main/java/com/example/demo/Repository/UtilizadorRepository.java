package com.example.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Utilizador;
import java.util.Optional;


@Repository
public interface UtilizadorRepository extends JpaRepository<Utilizador,Long>{
       Optional<Utilizador> findByEmail(String email); 
}
