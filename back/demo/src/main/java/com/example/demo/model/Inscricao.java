package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inscricao")
public class Inscricao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private Long idAluno;
    private Long idClasse;

    public Inscricao() {}

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public Long getIdAluno() {
        return idAluno;
    }
    public void setIdAluno(Long idAluno) {
        this.idAluno = idAluno;
    }
    public Long getIdClasse() {
        return idClasse;
    }
    public void setidClasse(Long id) {
        this.idClasse = id;
    }
    
    
}
