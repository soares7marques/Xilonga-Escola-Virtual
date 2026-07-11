package com.example.demo.Config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaResourceConfig implements WebMvcConfigurer {

    private final Path aulasDir;

    public MediaResourceConfig(@Value("${app.upload.aulas-dir:uploads/aulas}") String aulasDir) {
        this.aulasDir = resolverAulasDir(aulasDir);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/media/aulas/**")
            .addResourceLocations(aulasDir.toUri().toString());
    }

    private Path resolverAulasDir(String aulasDirConfigurado) {
        Path configurado = Paths.get(aulasDirConfigurado).toAbsolutePath().normalize();

        if (Files.exists(configurado)) {
            return configurado;
        }

        Path naRaizDoProjeto = Paths.get("..").resolve(aulasDirConfigurado).toAbsolutePath().normalize();
        if (Files.exists(naRaizDoProjeto)) {
            return naRaizDoProjeto;
        }

        String userDir = Paths.get("").toAbsolutePath().normalize().toString();
        if (userDir.endsWith("back/demo") || userDir.endsWith("back\\demo")) {
            return naRaizDoProjeto;
        }

        return configurado;
    }
}
