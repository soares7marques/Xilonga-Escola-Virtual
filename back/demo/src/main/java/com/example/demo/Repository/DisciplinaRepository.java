package com.example.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Disciplina;
import com.example.demo.model.Classe;

@Repository
public interface DisciplinaRepository extends JpaRepository<Disciplina, Long>{
  List<Disciplina> findByClasseId(Long classeId);

  Optional<Disciplina> findByClasseAndNome(Classe nivel,String nome);
}
