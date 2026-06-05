package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Administrador;
import com.example.demo.model.Utilizador;

@Repository
public interface AdminRepository extends JpaRepository<Administrador,Long>{
    Optional<Administrador> findByUtilizador(Utilizador utilizador);
    
}
