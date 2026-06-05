package com.example.demo.Service;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Repository.ClasseRepository;
import com.example.demo.model.Classe;

@Service
public class ClasseService {
    
    private ClasseRepository classeRepository;

    public ClasseService(ClasseRepository classeRepository) {
        this.classeRepository = classeRepository;
    }

    public ResponseEntity<?> criarClasse(Classe classe) {
        classeRepository.save(classe);
        return ResponseEntity.ok().body("cadastrado om sucesso");
    }

    public List<Classe> ListaClasse(){
        return classeRepository.findAll();
    }
}
