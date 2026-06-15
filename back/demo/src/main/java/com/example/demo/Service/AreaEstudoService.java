package com.example.demo.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.Repository.AlunoRepository;
import com.example.demo.Repository.ClasseRepository;
import com.example.demo.Repository.DisciplinaRepository;
import com.example.demo.Repository.InscricaoRepository;
import com.example.demo.model.Aluno;
import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;
import com.example.demo.model.Inscricao;

@Service
public class AreaEstudoService {

    private final ClasseRepository classeRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final InscricaoRepository inscricaoRepository;
    private final AlunoRepository alunoRepository;

    public AreaEstudoService(
            ClasseRepository classeRepository,
            DisciplinaRepository disciplinaRepository,
            InscricaoRepository inscricaoRepository,
            AlunoRepository alunoRepository) {
        this.classeRepository = classeRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.inscricaoRepository = inscricaoRepository;
        this.alunoRepository = alunoRepository;
    }

    public Map<String, Object> getResumo(String pesquisa) {
        String termo = normalizar(pesquisa);
        List<Classe> classes = classeRepository.findAll();
        List<Disciplina> disciplinas = disciplinaRepository.findAll();
        List<Inscricao> inscricoes = inscricaoRepository.findAll();
        Map<Long, Integer> pontuacaoPorAluno = alunoRepository.findAll().stream()
                .collect(Collectors.toMap(Aluno::getId, aluno -> parsePontuacao(aluno.getPontuacao())));

        List<Map<String, Object>> areas = new ArrayList<>();
        for (int index = 0; index < classes.size(); index++) {
            Classe classe = classes.get(index);
            List<String> disciplinasDaClasse = disciplinas.stream()
                    .filter(disciplina -> disciplina.getClasse() != null && disciplina.getClasse().getId() == classe.getId())
                    .map(Disciplina::getNome)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (!correspondePesquisa(classe, disciplinasDaClasse, termo)) {
                continue;
            }

            List<Inscricao> inscricoesDaClasse = inscricoes.stream()
                    .filter(inscricao -> inscricao.getIdClasse() != null && inscricao.getIdClasse().equals(classe.getId()))
                    .collect(Collectors.toList());

            long estudantes = inscricoesDaClasse.size();
            int taxaSucesso = calcularTaxaSucesso(inscricoesDaClasse, pontuacaoPorAluno);

            Map<String, Object> estatisticas = new HashMap<>();
            estatisticas.put("estudantes", estudantes);
            estatisticas.put("modulos", disciplinasDaClasse.size());
            estatisticas.put("taxa_sucesso", taxaSucesso);

            Map<String, Object> area = new HashMap<>();
            area.put("id", classe.getId());
            area.put("nome", classe.getNome());
            area.put("descricao", textoOuPadrao(classe.getDescricao(), "Classe disponível para estudo."));
            area.put("imagem", index % 2 == 0 ? "/imagem/escola1.jpeg" : "/imagem/escola2.jpeg");
            area.put("disciplinas", disciplinasDaClasse);
            area.put("cor", index % 2 == 0 ? "#5cd8d0" : "#7be6df");
            area.put("nivel", index == 0 ? "Primeiro nível" : "Nível " + (index + 1));
            area.put("estatisticas", estatisticas);
            area.put("passos", List.of(
                    "Assistir aula introdutória",
                    "Baixar material de apoio",
                    "Acompanhar progresso no perfil"));
            areas.add(area);
        }

        long totalEstudantes = areas.stream()
                .mapToLong(area -> ((Number) ((Map<?, ?>) area.get("estatisticas")).get("estudantes")).longValue())
                .sum();
        long totalModulos = areas.stream()
                .mapToLong(area -> ((Number) ((Map<?, ?>) area.get("estatisticas")).get("modulos")).longValue())
                .sum();
        int mediaSucesso = areas.isEmpty() ? 0 : (int) Math.round(areas.stream()
                .mapToInt(area -> ((Number) ((Map<?, ?>) area.get("estatisticas")).get("taxa_sucesso")).intValue())
                .average()
                .orElse(0));

        Map<String, Object> resumo = new HashMap<>();
        resumo.put("classesDisponiveis", areas.size());
        resumo.put("estudantesInscritos", totalEstudantes);
        resumo.put("modulosEstudo", totalModulos);
        resumo.put("taxaMediaSucesso", mediaSucesso);

        Map<String, Object> response = new HashMap<>();
        response.put("resumo", resumo);
        response.put("areas", areas);
        return response;
    }

    private boolean correspondePesquisa(Classe classe, List<String> disciplinas, String termo) {
        if (termo.isBlank()) {
            return true;
        }

        String nome = normalizar(classe.getNome());
        String descricao = normalizar(classe.getDescricao());
        boolean disciplinaEncontrada = disciplinas.stream()
                .map(this::normalizar)
                .anyMatch(disciplina -> disciplina.contains(termo));

        return nome.contains(termo) || descricao.contains(termo) || disciplinaEncontrada;
    }

    private int calcularTaxaSucesso(List<Inscricao> inscricoes, Map<Long, Integer> pontuacaoPorAluno) {
        List<Integer> pontuacoes = inscricoes.stream()
                .map(Inscricao::getIdAluno)
                .filter(Objects::nonNull)
                .map(pontuacaoPorAluno::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (pontuacoes.isEmpty()) {
            return 0;
        }

        return (int) Math.round(pontuacoes.stream().mapToInt(Integer::intValue).average().orElse(0));
    }

    private int parsePontuacao(String pontuacao) {
        try {
            int valor = Integer.parseInt(pontuacao == null ? "0" : pontuacao.trim());
            return Math.max(0, Math.min(100, valor));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private String textoOuPadrao(String texto, String padrao) {
        return texto == null || texto.isBlank() ? padrao : texto;
    }

    private String normalizar(String texto) {
        return texto == null ? "" : texto.trim().toLowerCase(Locale.ROOT);
    }
}
