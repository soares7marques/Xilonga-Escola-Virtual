package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "professor")
public class Professor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "id_utilizador", nullable = false, referencedColumnName = "id", insertable = true, updatable = false)
    private  Utilizador utilizador;

    @ManyToOne
    @JoinColumn(name = "id_Classe", nullable = false,referencedColumnName = "id",insertable = true,updatable = false)
    private  Classe classe;

    @ManyToOne
    @JoinColumn(name = "id_disciplina", nullable = false,referencedColumnName = "id",insertable = true,updatable = false)
    private  Disciplina disciplina;


    public Professor(){}

    public void setClasse(Classe classe){
        this.classe = classe;
    }

    public Classe getClasse(){
        return classe;
    }
    
    public void setUtilizador(Utilizador utilizador){
        this.utilizador = utilizador;
    }

    public Utilizador getUtilizador(){
        return utilizador;
    }

    public void setDisciplina(Disciplina disciplina){
        this.disciplina = disciplina;
    }

    public Disciplina getDisciplina(){
        return disciplina;
    }
}
