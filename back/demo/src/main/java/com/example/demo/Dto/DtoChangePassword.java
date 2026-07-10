package com.example.demo.Dto;

public class DtoChangePassword {
    private String email;
    private String senha;

    public DtoChangePassword() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}
