package com.example.demo.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Dto.DtoDisciplina;
import com.example.demo.Dto.DtoProfessor;
import com.example.demo.Service.AdminService;
import com.example.demo.Service.ClasseService;
import com.example.demo.Service.DisciplinaService;
import com.example.demo.Service.ProfessorService;
import com.example.demo.Service.TrimestreService;
import com.example.demo.model.Classe;
import com.example.demo.model.Disciplina;
import com.example.demo.model.Trimestre;
import com.example.demo.model.Utilizador;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/adminn")
@RestController
public class AdminController {

    private AdminService adminService;
    private ClasseService nivelService;
    private DisciplinaService disciplinaService;
    private ProfessorService professorService;
    private TrimestreService trimestreService;

    public AdminController(AdminService adminService, ClasseService nivelService,ProfessorService professorService,DisciplinaService disciplinaService, TrimestreService trimestreService) {
        this.adminService = adminService;
        this.nivelService = nivelService;
        this.professorService = professorService;
        this.disciplinaService = disciplinaService;
        this.trimestreService = trimestreService;

    }

    @PostMapping("/register")
    public ResponseEntity<?> registerAluno(@Valid @RequestBody Utilizador entity) {
        return ResponseEntity.ok().body(adminService.SalveAdmin(entity));
    }
    
    @PostMapping("/registerClasse")
    public ResponseEntity<?> registerClasse(@Valid @RequestBody Classe entity) {
        return ResponseEntity.ok().body(nivelService.criarClasse(entity));
    }

    @GetMapping("/listaClasse")
    public List<Classe> findClasse() {
        return nivelService.ListaClasse();
    }

    @PostMapping("/registerDisciplina")
    public ResponseEntity<?> registerDisciplina(@Valid @RequestBody DtoDisciplina entity)
    {
        return disciplinaService.criarDisciplina(entity);
    }

    @GetMapping("/listaDisciplina")
    public List<Disciplina> findDisciplina() {
        return disciplinaService.ListaDisciplinas();
    }

    @PostMapping({"/registerTrimestre", "/registerSemestre"})
    public ResponseEntity<?> registerTrimestre(@Valid @RequestBody Trimestre entity) {
        return trimestreService.criarTrimestre(entity);
    }

    @GetMapping({"/listaTrimestre", "/listaSemestre"})
    public List<Trimestre> findTrimestre() {
        return trimestreService.listarTrimestres();
    }

    @GetMapping("/quantidadeProfessores")
    public ResponseEntity<?> getQuantidadeProfessores() {
        return ResponseEntity.ok(professorService.getQuantidadeProfessores());
    }

    @GetMapping("/listaProfessores")
    public List<Map<String, Object>> findProfessores() {
        return professorService.listarProfessores();
    }
    
    
    @PostMapping("/registerProfessor")
    public ResponseEntity<?> registerPro(@Valid @RequestBody DtoProfessor entity)
    {
        return professorService.SalveProfessor(entity);
    }
}
