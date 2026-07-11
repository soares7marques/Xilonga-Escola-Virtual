package com.example.demo.Service;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Dto.DtoProfessor;
import com.example.demo.Exeception.ExceptionDadosDuplicado;
import com.example.demo.Repository.AlunoRepository;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.InscricaoRepository;
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
    private AlunoRepository alunoRepository;
    private InscricaoRepository inscricaoRepository;
    private ClasseRepository classeRepository;
    private PasswordEncoder passwordEncoder;
    private DisciplinaRepository disciplinaRepository;

    public ProfessorService(ProfessorRepository professorRepository, UtilizadorRepository utilizadorRepository, AlunoRepository alunoRepository,
            InscricaoRepository inscricaoRepository, PasswordEncoder passwordEncoder, ClasseRepository classeRepository,
    DisciplinaRepository disciplinaRepository){
        this.professorRepository = professorRepository;
        this.utilizadorRepository = utilizadorRepository;
        this.alunoRepository = alunoRepository;
        this.inscricaoRepository = inscricaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.classeRepository = classeRepository;
        this.disciplinaRepository = disciplinaRepository;
    }

    @Transactional
    public ResponseEntity<?> SalveProfessor(DtoProfessor request){
        String nome = normalizar(request.getNome());
        String email = normalizar(request.getEmail()).toLowerCase();
        String telefone = normalizar(request.getTelefone());
        String genero = normalizar(request.getGenero());
        String classeNome = normalizar(request.getClasse());
        String disciplinaNome = normalizar(request.getDisciplina());

        Classe optClasse = classeRepository.findByNome(classeNome)
            .orElseThrow(() -> new IllegalArgumentException("Classe não encontrada"));

        Disciplina otp = disciplinaRepository.findByClasseAndNome(optClasse, disciplinaNome)
            .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada para a classe selecionada"));

        Utilizador utilizador = utilizadorRepository.findByEmailIgnoreCase(email)
            .map(user -> {
                if (!"PROFESSOR".equalsIgnoreCase(user.getRole())) {
                    throw new ExceptionDadosDuplicado("Este email já está cadastrado para outro tipo de utilizador.");
                }
                return user;
            })
            .orElseGet(() -> {
                Utilizador novo = new Utilizador();
                String senhaEncriptada = passwordEncoder.encode(request.getSenha());
                novo.setSenha(senhaEncriptada);
                novo.setRole("PROFESSOR");
                novo.setNome(nome);
                novo.setEmail(email);
                novo.setTelefone(telefone);
                novo.setGenero(genero);
                return utilizadorRepository.save(novo);
            });

        if (professorRepository.existsByUtilizadorAndClasseAndDisciplina(utilizador, optClasse, otp)) {
            throw new ExceptionDadosDuplicado("Este professor já está associado a esta classe e disciplina.");
        }

        try {
            Professor prof = new Professor();
            prof.setUtilizador(utilizador);
            prof.setClasse(optClasse);
            prof.setDisciplina(otp);
            professorRepository.save(prof);
        } catch (DataIntegrityViolationException e) {
            throw new ExceptionDadosDuplicado("Não foi possível cadastrar: já existe um professor com estes dados.");
        }

        // Montar resposta
        Map<String, Object> response = new HashMap<>();
        response.put("role", utilizador.getRole());
        response.put("id", utilizador.getId());
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    public long getQuantidadeProfessores() {
        return professorRepository.findAll().stream()
            .map(Professor::getUtilizador)
            .filter(java.util.Objects::nonNull)
            .map(Utilizador::getId)
            .distinct()
            .count();
    }

    public Map<String, Object> getPerfilPorEmail(String email) {
        Utilizador utilizador = utilizadorRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        Professor professor = professorRepository.findByUtilizador(utilizador)
            .stream()
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Dados do professor não encontrados"));

        List<Map<String, String>> associacoes = professorRepository.findByUtilizador(utilizador).stream()
            .map(prof -> {
                Map<String, String> associacao = new HashMap<>();
                associacao.put("classe", prof.getClasse() == null ? "" : prof.getClasse().getNome());
                associacao.put("disciplina", prof.getDisciplina() == null ? "" : prof.getDisciplina().getNome());
                return associacao;
            })
            .toList();

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("nome", utilizador.getNome());
        perfil.put("email", utilizador.getEmail());
        perfil.put("role", utilizador.getRole());
        perfil.put("classe", professor.getClasse() == null ? "" : professor.getClasse().getNome());
        perfil.put("disciplina", professor.getDisciplina() == null ? "" : professor.getDisciplina().getNome());
        perfil.put("associacoes", associacoes);
        return perfil;
    }

    public List<Map<String, Object>> listarAlunosDaClasseDoProfessor(String email, String classeFiltro) {
        Map<String, Object> perfil = getPerfilPorEmail(email);
        List<Map<String, String>> associacoes = (List<Map<String, String>>) perfil.getOrDefault("associacoes", List.of());
        Set<String> classesPermitidas = associacoes.stream()
            .map(associacao -> associacao.get("classe"))
            .filter(classe -> classe != null && !classe.isBlank())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        String classeNormalizada = normalizar(classeFiltro);
        if (!classeNormalizada.isBlank()) {
            classesPermitidas.retainAll(Set.of(classeNormalizada));
        }

        if (classesPermitidas.isEmpty()) {
            return List.of();
        }

        Set<Long> classesIds = classesPermitidas.stream()
            .map(classeNome -> classeRepository.findByNome(classeNome)
                .orElseThrow(() -> new RuntimeException("Classe do professor não encontrada")))
            .map(Classe::getId)
            .collect(Collectors.toSet());

        Map<Long, String> nomesClasses = classeRepository.findAll().stream()
            .collect(Collectors.toMap(Classe::getId, Classe::getNome));

        return inscricaoRepository.findAll().stream()
            .filter(inscricao -> inscricao.getIdClasse() != null && classesIds.contains(inscricao.getIdClasse()))
            .map(inscricao -> {
                return alunoRepository.findById(inscricao.getIdAluno())
                    .map(aluno -> {
                Map<String, Object> alunoMap = new HashMap<>();
                Utilizador utilizador = aluno.getUtilizador();
                alunoMap.put("id", aluno.getId());
                alunoMap.put("nome", utilizador == null ? "" : utilizador.getNome());
                alunoMap.put("email", utilizador == null ? "" : utilizador.getEmail());
                alunoMap.put("telefone", utilizador == null ? "" : utilizador.getTelefone());
                alunoMap.put("genero", utilizador == null ? "" : utilizador.getGenero());
                alunoMap.put("pontuacao", aluno.getPontuacao());
                alunoMap.put("classe", nomesClasses.getOrDefault(inscricao.getIdClasse(), ""));
                return alunoMap;
                    });
            })
            .filter(java.util.Optional::isPresent)
            .map(java.util.Optional::get)
            .collect(Collectors.toList());
    }

    public boolean professorTemAssociacao(String email, String classeNome, String disciplinaNome) {
        Utilizador utilizador = utilizadorRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new RuntimeException("Professor não encontrado"));

        Classe classe = classeRepository.findByNome(normalizar(classeNome))
            .orElseThrow(() -> new IllegalArgumentException("Classe não encontrada"));

        Disciplina disciplina = disciplinaRepository.findByClasseAndNome(classe, normalizar(disciplinaNome))
            .orElseThrow(() -> new IllegalArgumentException("Disciplina não encontrada para a classe selecionada"));

        return professorRepository.existsByUtilizadorAndClasseAndDisciplina(utilizador, classe, disciplina);
    }
    
    public List<Map<String, Object>> listarProfessores() {
        return professorRepository.findAll().stream().map(prof -> {
            Map<String, Object> m = new HashMap<>();
            if (prof.getUtilizador() != null) {
                m.put("nome", prof.getUtilizador().getNome());
                m.put("email", prof.getUtilizador().getEmail());
                m.put("id", prof.getUtilizador().getId());
            } else {
                m.put("nome", "");
                m.put("email", "");
                m.put("id", null);
            }
            m.put("classe", prof.getClasse() == null ? "" : prof.getClasse().getNome());
            m.put("disciplina", prof.getDisciplina() == null ? "" : prof.getDisciplina().getNome());
            return m;
        }).collect(Collectors.toList());
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }
    

}
