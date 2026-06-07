package com.example.demo.Dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class DtoProfessor {

    @NotBlank(message = "nomclassee é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;

    @NotBlank(message = "Telefone é obrigatório")
    @Pattern(regexp = "^(\\+244)?\\s?9\\d{8}$", message = "Telefone deve ser válido")
    private String telefone;

    @NotBlank(message = "Gênero é obrigatório")
    private String genero;

    private String classe;
    private String disciplina;

    public void setClasse(String nome){
        this.classe = nome;
    }

    public String getClasse(){
        return classe;
    }

    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
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
    public String getTelefone() {
        return telefone;
    }
    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }
    public String getGenero() {
        return genero;
    }
    public void setGenero(String genero) {
        this.genero = genero;
    }

    public void setDisciplina(String nome){
        this.disciplina = nome;
    }

    public String getDisciplina(){
        return disciplina;
    }

}
