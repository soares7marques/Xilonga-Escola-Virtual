package com.example.demo.Service;

import java.util.List;

import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.Dto.DtoDisciplina;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.DisciplinaRepository;
import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;

@Service
public class DisciplinaService {
    
    private DisciplinaRepository disciplinaRepository;
    private ClasseRepository classeRepository;

    public DisciplinaService(DisciplinaRepository disciplinaRepository, ClasseRepository classeRepository) {
        this.disciplinaRepository = disciplinaRepository;
        this.classeRepository = classeRepository;
    }

    public ResponseEntity<?> criarDisciplina(DtoDisciplina request) {
        String nomeClasse = request.getClasse() == null ? "" : request.getClasse().trim();
        String nomeDisciplina = request.getNome() == null ? "" : request.getNome().trim();
        Optional<Classe> classeOptional = classeRepository.findByNome(nomeClasse); 
        
        if (classeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Classe não encontrada");
        }

        Classe classe = classeOptional.get();
        Disciplina disciplina = new Disciplina();
        disciplina.setNome(nomeDisciplina);
        disciplina.setClasse(classe);
        disciplinaRepository.save(disciplina);
        return ResponseEntity.ok().body("Disciplina criada com sucesso");
    }

    public List<Disciplina> ListaDisciplinas(){
        return disciplinaRepository.findAll();
    }
}
