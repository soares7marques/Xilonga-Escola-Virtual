package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "aluno")
public class Aluno {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String pontuacao = "0";

    @ManyToOne
    @JoinColumn(name = "id_utilizador", nullable = false,referencedColumnName = "id",insertable = true,updatable = false)
    private  Utilizador utilizador;

    public Aluno() {}

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }

    public String getPontuacao() {
        return pontuacao;
    }

    public void setPontuacao(String pontuacao) {
        this.pontuacao = pontuacao;
    }

    public void setUtilizador(Utilizador utilizador){
        this.utilizador = utilizador;
    }

    public Utilizador getUtilizador(){
        return utilizador;
    }
}

