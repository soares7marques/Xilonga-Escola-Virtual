   
package com.example.demo.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.Dto.DtoInscricao;
import com.example.demo.Exeception.ExceptionDadosDuplicado;
import com.example.demo.Repository.AlunoRepository;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.InscricaoRepository;
import com.example.demo.Repository.MaterialAulaRepository;
import com.example.demo.Repository.ProgressoMaterialAlunoRepository;
import com.example.demo.Repository.UtilizadorRepository;
import com.example.demo.model.Aluno;
import com.example.demo.model.Classe;
import com.example.demo.model.Inscricao;
import com.example.demo.model.MaterialAula;
import com.example.demo.model.ProgressoMaterialAluno;
import com.example.demo.model.Utilizador;

@Service
public class AlunoService {
   
    private final UtilizadorRepository utilizadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final InscricaoRepository inscricaoRepository;
    private final ClasseRepository classeRepository;
    private final AlunoRepository alunoRepository;
    private final MaterialAulaRepository materialAulaRepository;
    private final ProgressoMaterialAlunoRepository progressoMaterialAlunoRepository;


    public AlunoService(
            UtilizadorRepository utilizadorRepository,
            PasswordEncoder passwordEncoder,
            InscricaoRepository inscricaoRepository,
            ClasseRepository classeRepository,
            AlunoRepository alunoRepository,
            MaterialAulaRepository materialAulaRepository,
            ProgressoMaterialAlunoRepository progressoMaterialAlunoRepository) {
        this.utilizadorRepository = utilizadorRepository;
        this.passwordEncoder = passwordEncoder;
        this.inscricaoRepository = inscricaoRepository;
        this.classeRepository = classeRepository;
        this.alunoRepository = alunoRepository;
        this.materialAulaRepository = materialAulaRepository;
        this.progressoMaterialAlunoRepository = progressoMaterialAlunoRepository;
    }

    public ResponseEntity<?> SalveAluno(Utilizador utilizador){
        utilizadorRepository.findByEmail(utilizador.getEmail())
        .ifPresent((user)->{
            throw new ExceptionDadosDuplicado();
        });
        // Encriptar a senha antes de salvar
        String senhaEncriptada = passwordEncoder.encode(utilizador.getSenha());
        utilizador.setSenha(senhaEncriptada);
        utilizador.setRole("ALUNO"); // Definir a role padrão para o usuário

        utilizadorRepository.save(utilizador);
        Aluno aluno = new Aluno();
        aluno.setUtilizador(utilizador);
        alunoRepository.save(aluno);


        return ResponseEntity.ok().body(Map.of(
            "Email", utilizador.getEmail()
        ));
    }

    // Método para inscrição de aluno em uma área
    public ResponseEntity<?> inscricao(DtoInscricao dto){
        // Buscar usuário pelo email
        Utilizador utilizador = utilizadorRepository.findByEmail(dto.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Aluno aluno = alunoRepository.findByUtilizador(utilizador)
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        // Buscar área pelo nome
        Optional<Classe> opt = classeRepository.findByNome(dto.getClasse());
        if (opt.isEmpty()) {
            throw new RuntimeException("Área de estudo não encontrada");
        }
        Classe classe = opt.get();

        // Verificar se já está inscrito (por idAluno e idArea)
        Inscricao existente = inscricaoRepository.findByIdAlunoAndIdClasse(aluno.getId(), classe.getId());
        if (existente != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Aluno já está inscrito nesta classe");
            response.put("success", false);
            return ResponseEntity.badRequest().body(response);
        }

        // Criar inscrição
        Inscricao alunoClasse = new Inscricao();
        alunoClasse.setIdAluno(aluno.getId());
        alunoClasse.setidClasse(classe.getId());
        inscricaoRepository.save(alunoClasse);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Inscrição realizada com sucesso");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    // Retorna dados do perfil do aluno pelo email
    public Map<String, Object> getPerfilAlunoPorEmail(String email) {
        Utilizador utilizador = utilizadorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Buscar o aluno pelo utilizador
        Optional<Aluno> alunoOpt = alunoRepository.findByUtilizador(utilizador);
        if (alunoOpt.isEmpty()) {
            throw new RuntimeException("Aluno não encontrado");
        }
        Aluno aluno = alunoOpt.get();

        // Buscar a inscrição pelo id do aluno
        Inscricao inscricao = inscricaoRepository.findAll().stream()
            .filter(i -> i.getIdAluno() != null && i.getIdAluno().equals(aluno.getId()))
            .findFirst().orElse(null);

        String classeEstudo = null;
        if (inscricao != null && inscricao.getIdClasse() != null) {
            classeEstudo = classeRepository.findById(inscricao.getIdClasse())
                .map(Classe::getNome)
                .orElse("");
        }

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("nome", utilizador.getNome());
        perfil.put("contacto", utilizador.getTelefone());
        perfil.put("email", utilizador.getEmail());
        perfil.put("genero", utilizador.getGenero());
        perfil.put("classe", classeEstudo != null ? classeEstudo : "");
        perfil.put("pontuacao", aluno.getPontuacao());
        return perfil;
    }

    public Map<String, Object> getResumoProgressoPorEmail(String email) {
        Utilizador utilizador = utilizadorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Aluno aluno = alunoRepository.findByUtilizador(utilizador)
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        String classeAtual = obterClasseAluno(aluno);
        return recalcularResumoProgresso(aluno, classeAtual);
    }

    public Map<String, Object> registrarProgressoMaterial(String email, Long materialId) {
        if (materialId == null) {
            throw new IllegalArgumentException("Material inválido");
        }

        Utilizador utilizador = utilizadorRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Aluno aluno = alunoRepository.findByUtilizador(utilizador)
            .orElseThrow(() -> new RuntimeException("Aluno não encontrado"));

        MaterialAula material = materialAulaRepository.findById(materialId)
            .orElseThrow(() -> new RuntimeException("Material não encontrado"));

        progressoMaterialAlunoRepository.findByAlunoIdAndMaterialId(aluno.getId(), materialId)
            .orElseGet(() -> {
                ProgressoMaterialAluno progresso = new ProgressoMaterialAluno();
                progresso.setAlunoId(aluno.getId());
                progresso.setMaterialId(material.getId());
                progresso.setDisciplina(material.getDisciplina());
                progresso.setSemestre(material.getSemestre());
                return progressoMaterialAlunoRepository.save(progresso);
            });

        return recalcularResumoProgresso(aluno, obterClasseAluno(aluno));
    }

        // Retorna o ranking dos alunos: nome e pontuação, ordenado por maior pontuação e ordem alfabética
    public java.util.List<Map<String, Object>> getRankingAlunos() {
        java.util.List<Aluno> alunos = alunoRepository.findAll();
        java.util.List<Map<String, Object>> ranking = new java.util.ArrayList<>();
        for (Aluno aluno : alunos) {
            Utilizador utilizador = aluno.getUtilizador();
            if (utilizador != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("nome", utilizador.getNome());
                item.put("pontuacao", parsePontuacao(aluno.getPontuacao()));
                ranking.add(item);
            }
        }
        // Ordenar por pontuação decrescente e nome crescente
        ranking.sort((a, b) -> {
            int cmp = Integer.compare((Integer) b.get("pontuacao"), (Integer) a.get("pontuacao"));
            if (cmp == 0) {
                return a.get("nome").toString().compareToIgnoreCase(b.get("nome").toString());
            }
            return cmp;
        });
        return ranking;
    }

        // Retorna a quantidade total de alunos
    public long getQuantidadeAlunos() {
        return alunoRepository.count();
    }

    private String obterClasseAluno(Aluno aluno) {
        Inscricao inscricao = inscricaoRepository.findAll().stream()
            .filter(item -> item.getIdAluno() != null && item.getIdAluno().equals(aluno.getId()))
            .findFirst()
            .orElse(null);

        if (inscricao != null && inscricao.getIdClasse() != null) {
            return classeRepository.findById(inscricao.getIdClasse())
                .map(Classe::getNome)
                .orElse("");
        }

        return "";
    }

    private Map<String, Object> recalcularResumoProgresso(Aluno aluno, String classeAtual) {
        List<MaterialAula> materiais = materialAulaRepository.findAll().stream()
            .filter(material -> classeAtual == null || classeAtual.isBlank() || classeAtual.equalsIgnoreCase(material.getClasse()))
            .filter(material -> material.getDisciplina() != null && !material.getDisciplina().isBlank())
            .collect(Collectors.toList());

        Set<Long> materiaisVistos = progressoMaterialAlunoRepository.findByAlunoId(aluno.getId()).stream()
            .map(ProgressoMaterialAluno::getMaterialId)
            .filter(id -> id != null)
            .collect(Collectors.toSet());

        Map<String, List<MaterialAula>> materiaisPorDisciplina = materiais.stream()
            .collect(Collectors.groupingBy(MaterialAula::getDisciplina, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> disciplinas = new ArrayList<>();
        int totalPontuacao = 0;
        int videosAssistidos = 0;
        int videosTotais = 0;

        for (Map.Entry<String, List<MaterialAula>> entry : materiaisPorDisciplina.entrySet()) {
            List<MaterialAula> materiaisDaDisciplina = entry.getValue();
            int totalVideos = materiaisDaDisciplina.size();
            int videosVistos = (int) materiaisDaDisciplina.stream()
                .map(MaterialAula::getId)
                .filter(materiaisVistos::contains)
                .count();
            int progresso = totalVideos == 0 ? 0 : (int) Math.round((videosVistos * 100.0) / totalVideos);

            Map<String, Object> disciplina = new HashMap<>();
            disciplina.put("nome", entry.getKey());
            disciplina.put("progresso", progresso);
            disciplina.put("videosVistos", videosVistos);
            disciplina.put("totalVideos", totalVideos);
            disciplinas.add(disciplina);

            totalPontuacao += progresso;
            videosAssistidos += videosVistos;
            videosTotais += totalVideos;
        }

        disciplinas.sort((a, b) -> {
            int cmp = Integer.compare((Integer) b.get("progresso"), (Integer) a.get("progresso"));
            if (cmp == 0) {
                return a.get("nome").toString().compareToIgnoreCase(b.get("nome").toString());
            }
            return cmp;
        });

        String pontuacaoAtual = String.valueOf(Math.max(0, totalPontuacao));
        if (!pontuacaoAtual.equals(aluno.getPontuacao())) {
            aluno.setPontuacao(pontuacaoAtual);
            alunoRepository.save(aluno);
        }

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("total", totalPontuacao);
        resumo.put("pontuacao", pontuacaoAtual);
        resumo.put("disciplinas", disciplinas);
        resumo.put("videosAssistidos", videosAssistidos);
        resumo.put("videosTotais", videosTotais);
        resumo.put("videosAssistidosIds", new ArrayList<>(materiaisVistos));
        return resumo;
    }

    private int parsePontuacao(String pontuacao) {
        try {
            return Integer.parseInt(pontuacao == null ? "0" : pontuacao.trim());
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

}
