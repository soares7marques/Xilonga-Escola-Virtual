package com.example.demo.Dto;

public class DtoInscricao {
    private String email;
    private String classe;

    public DtoInscricao() {}

    public DtoInscricao(String email, String classe) {
        this.email = email;
        this.classe = classe;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getClasse() {
        return classe;
    }

    public void setClasse(String classe) {
        this.classe = classe;
    }
}
