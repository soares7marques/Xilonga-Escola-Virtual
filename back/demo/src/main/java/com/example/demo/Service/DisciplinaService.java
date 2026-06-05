package com.example.demo.Service;

import java.util.List;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import com.example.demo.Dto.DtoDisciplina;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.DisciplinaRepository;
import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;

public class DisciplinaService {
    
    private DisciplinaRepository disciplinaRepository;
    private ClasseRepository classeRepository;

    public DisciplinaService(DisciplinaRepository disciplinaRepository) {
        this.disciplinaRepository = disciplinaRepository;
    }

    public ResponseEntity<?> criarDisciplina(DtoDisciplina request) {
        Optional<Classe> classeOptional = classeRepository.findByNome(request.getClasse()); 
        
        if (classeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Classe não encontrada");
        }

        Classe classe = classeOptional.get();
        Disciplina disciplina = new Disciplina();
        disciplina.setNome(request.getNomeDisciplina());
        disciplina.setClasse(classe);
        disciplinaRepository.save(disciplina);
        return ResponseEntity.ok().body("Disciplina criada com sucesso");
    }

    public List<Disciplina> ListaDisciplinas(){
        return disciplinaRepository.findByClasseId(1L);
    }
}
