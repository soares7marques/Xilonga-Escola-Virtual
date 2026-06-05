package com.example.demo.Service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.model.Utilizador;
import com.example.demo.Repository.UtilizadorRepository;
@Service
public class UsuarioDetailsService implements UserDetailsService{
    private final UtilizadorRepository utilizadorRepository;
    

    public UsuarioDetailsService(UtilizadorRepository utilizadorRepository){
          this.utilizadorRepository = utilizadorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        
        Utilizador utilizador = utilizadorRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("Usuario não encontrado"));

        return User.builder()
            .password(utilizador.getSenha()).build();
    }
    
}
