package com.example.demo.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.Aluno;
import com.example.demo.model.Utilizador;




@Repository
public interface AlunoRepository extends JpaRepository<Aluno,Long>{
    Optional<Aluno> findByUtilizador(Utilizador utilizador);

}
