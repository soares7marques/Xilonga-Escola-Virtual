package com.example.demo.Dto;

import java.util.function.BiConsumer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DtoLogin {
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;

    private String role;

    private Boolean success;

    public Boolean getSuccess(){
        return success;
    }

    public void setSuccess(Boolean success){
        this.success = success;
    }

    public String getRole(){
        return role;
    }

    public void setRole(String role){
        this.role = role;
    }
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
