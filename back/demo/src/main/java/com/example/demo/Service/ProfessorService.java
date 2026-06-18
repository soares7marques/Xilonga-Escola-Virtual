package com.example.demo.Service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public ResponseEntity<?> SalveProfessor(DtoProfessor request){
        utilizadorRepository.findByEmail(request.getEmail())
        .ifPresent((user)->{
            throw new ExceptionDadosDuplicado();
        });

        Classe optClasse = classeRepository.findByNome(request.getClasse())
            .orElseThrow(() -> new IllegalArgumentException("Classe não encontrada"));

        Disciplina otp = disciplinaRepository.findByClasseAndNome(optClasse, request.getDisciplina())
            .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada para a classe selecionada"));

        // Encriptar a senha antes de salvar
        Utilizador utilizador = new Utilizador();
        String senhaEncriptada = passwordEncoder.encode(request.getSenha());
        utilizador.setSenha(senhaEncriptada);
        utilizador.setRole("PROFESSOR"); // Definir a role padrão para o usuário
        utilizador.setNome(request.getNome());
        utilizador.setEmail(request.getEmail());
        utilizador.setTelefone(request.getTelefone());
        utilizador.setGenero(request.getGenero());

        utilizadorRepository.save(utilizador);
        professorRepository.findByUtilizador(utilizador).ifPresent(professor -> {
            throw new IllegalArgumentException("Professor já possui classe e disciplina associadas.");
        });

        Professor prof = new Professor();
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

    public Map<String, Object> getPerfilPorEmail(String email) {
        Utilizador utilizador = utilizadorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        Professor professor = professorRepository.findByUtilizador(utilizador)
            .orElseThrow(() -> new RuntimeException("Dados do professor não encontrados"));

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("nome", utilizador.getNome());
        perfil.put("email", utilizador.getEmail());
        perfil.put("role", utilizador.getRole());
        perfil.put("classe", professor.getClasse() == null ? "" : professor.getClasse().getNome());
        perfil.put("disciplina", professor.getDisciplina() == null ? "" : professor.getDisciplina().getNome());
        return perfil;
    }
    

}
