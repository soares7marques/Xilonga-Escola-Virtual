package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "disciplina")
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    
    private String nome;

    @ManyToOne
    @JoinColumn(name = "id_Classe", nullable = false,referencedColumnName = "id",insertable = true,updatable = false)
    private  Classe classe;

    public Disciplina(){}

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }

    
    public void setClasse(Classe classe){
        this.classe = classe;
    }

    public Classe getClasse(){
        return classe;
    }
}
