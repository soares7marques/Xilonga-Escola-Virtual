package com.example.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Service.AreaEstudoService;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/area-estudo")
@RestController
public class AreaEstudoController {

    private final AreaEstudoService areaEstudoService;

    public AreaEstudoController(AreaEstudoService areaEstudoService) {
        this.areaEstudoService = areaEstudoService;
    }

    @GetMapping
    public ResponseEntity<?> listarAreas(@RequestParam(required = false) String pesquisa) {
        return ResponseEntity.ok(areaEstudoService.getResumo(pesquisa));
    }
}
