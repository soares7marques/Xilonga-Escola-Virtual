package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin")
public class Administrador {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String cargo = "GestorSite";

    @OneToOne
    @JoinColumn(name = "id_utilizador", nullable = false,referencedColumnName = "id",insertable = true,updatable = false)
    private  Utilizador utilizador;

    public Administrador() {}

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public Utilizador getUtilizador(){
        return utilizador;
    }

    public void setUtilizador(Utilizador utilizador){
        this.utilizador = utilizador;
    }
}
