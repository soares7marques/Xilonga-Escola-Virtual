package com.example.demo.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.Dto.DtoProfessor;
import com.example.demo.Exeception.ExceptionDadosDuplicado;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.DisciplinaRepository;
import com.example.demo.Repository.ProfessorRepository;
import com.example.demo.Repository.UtilizadorRepository;
import com.example.demo.model.Professor;
import com.example.demo.model.Utilizador;
import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;
@Service
public class ProfessorService {

    private ProfessorRepository professorRepository;
    private UtilizadorRepository utilizadorRepository;
    private ClasseRepository classeRepository;
    private PasswordEncoder passwordEncoder;
    private DisciplinaRepository disciplinaRepository;

    public ProfessorService(ProfessorRepository professorRepository, UtilizadorRepository utilizadorRepository,PasswordEncoder passwordEncoder,ClasseRepository classeRepository
    ,DisciplinaRepository disciplinaRepository){
        this.professorRepository = professorRepository;
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.classeRepository = classeRepository;
        this.disciplinaRepository = disciplinaRepository;
    }

    public ResponseEntity<?> SalveProfessor(DtoProfessor request){
        utilizadorRepository.findByEmail(request.getEmail())
        .ifPresent((user)->{
            throw new ExceptionDadosDuplicado();
        });
        // Encriptar a senha antes de salvar
        Utilizador utilizador = new Utilizador();
        String senhaEncriptada = passwordEncoder.encode(request.getSenha());
        utilizador.setSenha(senhaEncriptada);
        utilizador.setRole("professor"); // Definir a role padrão para o usuário
        utilizador.setNome(request.getNome());
        utilizador.setEmail(request.getEmail());
        utilizador.setTelefone(request.getTelefone());
        utilizador.setGenero(request.getGenero());

        utilizadorRepository.save(utilizador);
        Professor prof = new Professor();

        Optional<Classe> opt = classeRepository.findByNome(request.getClasse());
        Classe optClasse = opt.get();

        Optional<Disciplina> disc = disciplinaRepository.findByClasseAndNome(optClasse, request.getDisciplina());
        Disciplina otp = disc.get();
        prof.setUtilizador(utilizador);
        prof.setClasse(optClasse);
        prof.setDisciplina(otp);
        professorRepository.save(prof);
        // Montar resposta
        Map<String, Object> response = new HashMap<>();
        response.put("role", utilizador.getRole());
        response.put("id", utilizador.getId());
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    public long getQuantidadeProfessores() {
        return professorRepository.count();
    }
    

}
