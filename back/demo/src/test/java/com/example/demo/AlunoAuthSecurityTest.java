package com.example.demo;

import com.example.demo.Controller.AlunoController;
import com.example.demo.Controller.UtilizadorController;
import com.example.demo.Exeception.ExceptionDadosDuplicado;
import com.example.demo.Exeception.ExceptionGlobal;
import com.example.demo.Security.JwtAuthenticationFilter;
import com.example.demo.Security.JwtService;
import com.example.demo.Security.SecurityConfig;
import com.example.demo.Service.AlunoService;
import com.example.demo.Service.UsuarioDetailsService;
import com.example.demo.Service.UtilizadorService;
import com.example.demo.model.Utilizador;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AlunoController.class, UtilizadorController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, ExceptionGlobal.class})
class AlunoAuthSecurityTest {

    private static boolean simularEmailDuplicado;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        simularEmailDuplicado = false;
    }

    @Test
    void registoNovoAlunoComDadosValidos() throws Exception {
        mockMvc.perform(post("/aluno/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                            {
                              "nome": "Aluno Teste",
                              "email": "aluno@teste.com",
                              "senha": "123456",
                              "genero": "Masculino",
                              "telefone": "923456789"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.body.Email").value("aluno@teste.com"));
    }

    @Test
    void registoComLoginJaExistente() throws Exception {
        simularEmailDuplicado = true;

        mockMvc.perform(post("/aluno/register")
                        .contentType(APPLICATION_JSON)
                        .content("""
                            {
                              "nome": "Aluno Teste",
                              "email": "aluno@teste.com",
                              "senha": "123456",
                              "genero": "Masculino",
                              "telefone": "923456789"
                            }
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void loginComCredenciaisValidas() throws Exception {
        mockMvc.perform(post("/utilizador/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                            {
                              "email": "aluno@teste.com",
                              "senha": "123456"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void loginComSenhaIncorreta() throws Exception {
        mockMvc.perform(post("/utilizador/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                            {
                              "email": "aluno@teste.com",
                              "senha": "senhaerrada"
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email ou senha incorretos"));
    }

    @Test
    void testeSqlInjectionNoLogin() throws Exception {
        mockMvc.perform(post("/utilizador/login")
                        .contentType(APPLICATION_JSON)
                        .content("""
                            {
                              "email": "' OR '1'='1",
                              "senha": "' OR '1'='1"
                            }
                        """))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void acessoDiretoUrlRestritaSemToken() throws Exception {
        mockMvc.perform(get("/aluno/perfil")
                        .param("email", "aluno@teste.com"))
                .andExpect(status().isForbidden());
    }

    @TestConfiguration
    static class TestConfig {

        @Bean
        AlunoService alunoService() {
            return new AlunoService(null, null, null, null, null, null, null) {
                @Override
                public ResponseEntity<?> SalveAluno(Utilizador utilizador) {
                    if (simularEmailDuplicado) {
                        throw new ExceptionDadosDuplicado();
                    }

                    return ResponseEntity.ok(Map.of("Email", utilizador.getEmail()));
                }
            };
        }

        @Bean
        UtilizadorService utilizadorService() {
            return new UtilizadorService(null, null, null) {
                @Override
                public ResponseEntity<?> login(com.example.demo.Dto.DtoLogin request) {
                    if ("123456".equals(request.getSenha())) {
                        return ResponseEntity.ok(Map.of(
                                "success", true,
                                "email", request.getEmail(),
                                "tokenType", "Bearer",
                                "token", "token-falso-para-teste"
                        ));
                    }

                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Email ou senha incorretos"));
                }
            };
        }

        @Bean
        JwtService jwtService() {
            return new JwtService();
        }

        @Bean
        UsuarioDetailsService usuarioDetailsService() {
            return new UsuarioDetailsService(null);
        }

        @Bean
        MessageSource messageSource() {
            return new StaticMessageSource();
        }
    }
}
