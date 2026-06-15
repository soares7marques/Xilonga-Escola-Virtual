package com.example.demo.Dto;

import jakarta.validation.constraints.NotBlank;

public class DtoProva {

    @NotBlank(message = "Classe é obrigatória")
    private String classe;

    @NotBlank(message = "Disciplina é obrigatória")
    private String disciplina;

    @NotBlank(message = "Semestre é obrigatório")
    private String semestre;

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    private String descricao;
    private String perguntas;

    public String getClasse() {
        return classe;
    }

    public void setClasse(String classe) {
        this.classe = classe;
    }

    public String getDisciplina() {
        return disciplina;
    }

    public void setDisciplina(String disciplina) {
        this.disciplina = disciplina;
    }

    public String getSemestre() {
        return semestre;
    }

    public void setSemestre(String semestre) {
        this.semestre = semestre;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getPerguntas() {
        return perguntas;
    }

    public void setPerguntas(String perguntas) {
        this.perguntas = perguntas;
    }
}
