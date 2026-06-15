import React, { useState, useEffect } from 'react';
import './DashboadProf.css';
import { FaUserGraduate, FaChalkboardTeacher,FaBookOpen, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, apiFetch, clearAuthSession, getCurrentUser } from '../../services/api';


const Dashboard = ({ onDisponibilizarMaterial, onCriarProva, onSair }) => {
  const navigate = useNavigate();
  // Estado para dados do usuário
  const [usuario] = useState(getCurrentUser());
  const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
  const Classes = "7ª"; // valor fixo

  useEffect(() => {

    // Buscar quantidade de alunos
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await apiFetch('http://localhost:8080/aluno/quantidade', {
          headers: {}
        });
        if (response.ok) {
          const data = await response.json();
          setQuantidadeAlunos(typeof data === 'number' ? data : Number(data));
        }
      } catch (e) {}
    };
    fetchQuantidadeAlunos();
  }, []);
  const [activeForm, setActiveForm] = useState(null);
  const [classeNome, setClasseNome] = useState("");
  const [classeDescricao, setClasseDescricao] = useState("");
  const [semestres, setSemestres] = useState([]); // lista de semestres cadastrados
  const [classeSelecionada, setClasseSelecionada] = useState("");
  const [semestreNome, setSemestreNome] = useState("");
  
  // Estado para disponibilizar material
  const [materialClasse, setMaterialClasse] = useState("");
  const [materialDisciplina, setMaterialDisciplina] = useState("");
  const [materialSemestre, setMaterialSemestre] = useState("");
  const [materialTitulo, setMaterialTitulo] = useState("");
  const [materialArquivo, setMaterialArquivo] = useState(null);
  const [enviandoVideo, setEnviandoVideo] = useState(false);
  const [feedbackUpload, setFeedbackUpload] = useState({ tipo: "", mensagem: "" });
  const [provaTitulo, setProvaTitulo] = useState("");
  const [provaDescricao, setProvaDescricao] = useState("");
  const [provaPerguntas, setProvaPerguntas] = useState("");
  const [feedbackProva, setFeedbackProva] = useState({ tipo: "", mensagem: "" });
  const [materiais, setMateriais] = useState([]);
  const [provas, setProvas] = useState([]);
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroSemestre, setFiltroSemestre] = useState("");
  
  // Simulação de lista de classes cadastradas
  const [classes, setClasses] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  
  // Listas de disciplinas e semestres
  const disciplinasDisponiveis = disciplinas.length > 0
    ? disciplinas.map((disciplina) => disciplina.nome)
    : ["Matemática", "Química", "Física", "Biologia", "História", "Geografia", "Português", "Educação Física", "Artes", "Informática"];
  
  const semestresDisponiveis = ["1º Semestre", "2º Semestre", "3º Semestre"];

  const carregarDadosBase = async () => {
    try {
      const [classesResponse, disciplinasResponse] = await Promise.all([
        apiFetch(`${API_BASE_URL}/adminn/listaClasse`),
        apiFetch(`${API_BASE_URL}/adminn/listaDisciplina`)
      ]);

      if (classesResponse.ok) {
        setClasses(await classesResponse.json());
      }

      if (disciplinasResponse.ok) {
        const data = await disciplinasResponse.json();
        setDisciplinas(Array.isArray(data) ? data : []);
      }
    } catch {
      // Mantém as opções locais quando o backend ainda não tiver dados.
    }
  };

  const carregarListas = async () => {
    const params = new URLSearchParams();

    if (filtroDisciplina) {
      params.set("disciplina", filtroDisciplina);
    }

    if (filtroSemestre) {
      params.set("semestre", filtroSemestre);
    }

    try {
      const query = params.toString() ? `?${params.toString()}` : "";
      const [materiaisResponse, provasResponse] = await Promise.all([
        apiFetch(`${API_BASE_URL}/professor/materiais${query}`),
        apiFetch(`${API_BASE_URL}/professor/provas${query}`)
      ]);

      if (materiaisResponse.ok) {
        setMateriais(await materiaisResponse.json());
      }

      if (provasResponse.ok) {
        setProvas(await provasResponse.json());
      }
    } catch {
      setFeedbackUpload({ tipo: "erro", mensagem: "Não foi possível carregar materiais e provas." });
    }
  };

  useEffect(() => {
    carregarDadosBase();
    carregarListas();
  }, []);
  // Função para cadastrar semestre
  const handleCadastrarSemestre = (e) => {
    e.preventDefault();
    if (classeSelecionada && semestreNome) {
      setSemestres([...semestres, { classe: classeSelecionada, nome: semestreNome }]);
      setSemestreNome("");
      setClasseSelecionada("");
      setActiveForm(null);
    }
  };

  const handleCriarClasse = (e) => {
    e.preventDefault();
    if (onCriarClasse) onCriarClasse({ nome: classeNome, descricao: classeDescricao });
    setClasseNome("");
    setClasseDescricao("");
    setActiveForm(null);
  };

  const handleSair = () => {
    clearAuthSession();
    if (onSair) {
      onSair();
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleDisponibilizarMaterial = async (e) => {
    e.preventDefault();
    setFeedbackUpload({ tipo: "", mensagem: "" });
    
    if (!materialClasse || !materialDisciplina || !materialSemestre || !materialTitulo || !materialArquivo) {
      setFeedbackUpload({ tipo: "erro", mensagem: "Preencha todos os campos." });
      return;
    }

    if (!materialArquivo.type.startsWith('video/')) {
      setFeedbackUpload({ tipo: "erro", mensagem: "Arquivo inválido. Selecione um vídeo." });
      return;
    }

    const formData = new FormData();
    formData.append('classe', materialClasse);
    formData.append('disciplina', materialDisciplina);
    formData.append('semestre', materialSemestre);
    formData.append('titulo', materialTitulo);
    formData.append('video', materialArquivo);

    try {
      setEnviandoVideo(true);

      const response = await apiFetch(`${API_BASE_URL}/professor/materiais`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar vídeo.");
      }

      setFeedbackUpload({
        tipo: "sucesso",
        mensagem: `Vídeo "${materialTitulo}" recebido com sucesso!`
      });

      // Limpar formulário
      setMaterialClasse("");
      setMaterialDisciplina("");
      setMaterialSemestre("");
      setMaterialTitulo("");
      setMaterialArquivo(null);
      carregarListas();
    } catch (error) {
      setFeedbackUpload({
        tipo: "erro",
        mensagem: "Falha ao enviar vídeo. Tente novamente."
      });
    } finally {
      setEnviandoVideo(false);
    }
  };

  const handleCriarProva = async (e) => {
    e.preventDefault();
    setFeedbackProva({ tipo: "", mensagem: "" });

    if (!materialClasse || !materialDisciplina || !materialSemestre || !provaTitulo) {
      setFeedbackProva({ tipo: "erro", mensagem: "Preencha classe, disciplina, semestre e título." });
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/professor/provas`, {
        method: "POST",
        body: JSON.stringify({
          classe: materialClasse,
          disciplina: materialDisciplina,
          semestre: materialSemestre,
          titulo: provaTitulo,
          descricao: provaDescricao,
          perguntas: provaPerguntas
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao criar prova.");
      }

      setFeedbackProva({ tipo: "sucesso", mensagem: "Prova criada com sucesso!" });
      setProvaTitulo("");
      setProvaDescricao("");
      setProvaPerguntas("");
      carregarListas();
    } catch {
      setFeedbackProva({ tipo: "erro", mensagem: "Falha ao criar prova. Tente novamente." });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Exemplo de uso dos dados do usuário */}
      <div style={{position: 'absolute', top: 10, right: 20, fontSize: '1em', color: '#555'}}>
        <span><strong>{usuario.role}</strong> | {usuario.email}</span>
      </div>
      <aside className="dashboard-sidebar">
        <h2>Menu</h2>
        <button onClick={() => setActiveForm(activeForm === 'material' ? null : 'material')}><FaBookOpen style={{marginRight:8}}/>Disponibilizar Material</button>
        <button onClick={() => setActiveForm(activeForm === 'prova' ? null : 'prova')}><FaFileAlt style={{marginRight:8}}/>Criar Prova</button>
        <button onClick={() => setActiveForm(activeForm === 'listar' ? null : 'listar')}><FaFileAlt style={{marginRight:8}}/>Materiais e Provas</button>
        <button className="sair" onClick={handleSair}><FaSignOutAlt style={{marginRight:8}}/>Sair</button>
      </aside>
      <main className="dashboard-main">
        <h1>Dashboard do Professor</h1>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaUserGraduate className="dashboard-icon" />
            <span className="dashboard-card-title">Alunos</span>
            <span className="dashboard-card-value">{quantidadeAlunos}</span>
          </div>
          <div className="dashboard-card">
            <FaChalkboardTeacher className="dashboard-icon" />
            <span className="dashboard-card-title">Classe</span>
            <span className="dashboard-card-value">{Classes}</span>
          </div>
        </div>

        {/* Formulário SPA para Disponibilizar Material */}
        {activeForm === 'material' && (
          <form className="dashboard-form" onSubmit={handleDisponibilizarMaterial}>
            <h2><FaBookOpen style={{marginRight:8}}/>Disponibilizar Vídeo</h2>
            
            <label htmlFor="classe-select">Classe:</label>
            <select 
              id="classe-select"
              value={materialClasse} 
              onChange={e => setMaterialClasse(e.target.value)} 
              required
            >
              <option value="">Selecione a Classe</option>
              {classes.map((classe, idx) => (
                <option key={idx} value={classe.nome}>{classe.nome}</option>
              ))}
            </select>

            <label htmlFor="disciplina-select">Disciplina:</label>
            <select 
              id="disciplina-select"
              value={materialDisciplina} 
              onChange={e => setMaterialDisciplina(e.target.value)} 
              required
            >
              <option value="">Selecione a Disciplina</option>
              {disciplinasDisponiveis.map((disciplina, idx) => (
                <option key={idx} value={disciplina}>{disciplina}</option>
              ))}
            </select>

            <label htmlFor="semestre-select">Semestre:</label>
            <select 
              id="semestre-select"
              value={materialSemestre} 
              onChange={e => setMaterialSemestre(e.target.value)} 
              required
            >
              <option value="">Selecione o Semestre</option>
              {semestresDisponiveis.map((semestre, idx) => (
                <option key={idx} value={semestre}>{semestre}</option>
              ))}
            </select>

            <label htmlFor="titulo-input">Título do Vídeo:</label>
            <input
              id="titulo-input"
              type="text"
              placeholder="Ex: Números Inteiros"
              value={materialTitulo}
              onChange={e => setMaterialTitulo(e.target.value)}
              required
            />

            <label htmlFor="video-input">Upload do Vídeo:</label>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              onChange={e => {
                setMaterialArquivo(e.target.files?.[0] || null);
                setFeedbackUpload({ tipo: "", mensagem: "" });
              }}
              required
            />

            {feedbackUpload.mensagem && (
              <div className={`feedback-upload ${feedbackUpload.tipo}`}>
                {feedbackUpload.mensagem}
              </div>
            )}

            <button type="submit" disabled={enviandoVideo}>
              <FaBookOpen style={{marginRight:8}}/>
              {enviandoVideo ? "Enviando vídeo..." : "Adicionar Vídeo"}
            </button>
          </form>
        )}

        {activeForm === 'prova' && (
          <form className="dashboard-form" onSubmit={handleCriarProva}>
            <h2><FaFileAlt style={{marginRight:8}}/>Criar Prova</h2>

            <label htmlFor="prova-classe-select">Classe:</label>
            <select
              id="prova-classe-select"
              value={materialClasse}
              onChange={e => setMaterialClasse(e.target.value)}
              required
            >
              <option value="">Selecione a Classe</option>
              {classes.map((classe, idx) => (
                <option key={idx} value={classe.nome}>{classe.nome}</option>
              ))}
            </select>

            <label htmlFor="prova-disciplina-select">Disciplina:</label>
            <select
              id="prova-disciplina-select"
              value={materialDisciplina}
              onChange={e => setMaterialDisciplina(e.target.value)}
              required
            >
              <option value="">Selecione a Disciplina</option>
              {disciplinasDisponiveis.map((disciplina, idx) => (
                <option key={idx} value={disciplina}>{disciplina}</option>
              ))}
            </select>

            <label htmlFor="prova-semestre-select">Semestre:</label>
            <select
              id="prova-semestre-select"
              value={materialSemestre}
              onChange={e => setMaterialSemestre(e.target.value)}
              required
            >
              <option value="">Selecione o Semestre</option>
              {semestresDisponiveis.map((semestre, idx) => (
                <option key={idx} value={semestre}>{semestre}</option>
              ))}
            </select>

            <label htmlFor="prova-titulo-input">Título da Prova:</label>
            <input
              id="prova-titulo-input"
              type="text"
              placeholder="Ex: Prova de Números Inteiros"
              value={provaTitulo}
              onChange={e => setProvaTitulo(e.target.value)}
              required
            />

            <label htmlFor="prova-descricao-input">Descrição:</label>
            <textarea
              id="prova-descricao-input"
              placeholder="Resumo da prova"
              value={provaDescricao}
              onChange={e => setProvaDescricao(e.target.value)}
            />

            <label htmlFor="prova-perguntas-input">Perguntas:</label>
            <textarea
              id="prova-perguntas-input"
              placeholder="Digite as perguntas, uma por linha"
              value={provaPerguntas}
              onChange={e => setProvaPerguntas(e.target.value)}
            />

            {feedbackProva.mensagem && (
              <div className={`feedback-upload ${feedbackProva.tipo}`}>
                {feedbackProva.mensagem}
              </div>
            )}

            <button type="submit">
              <FaFileAlt style={{marginRight:8}}/>
              Criar Prova
            </button>
          </form>
        )}

        {activeForm === 'listar' && (
          <section className="dashboard-list-panel">
            <h2>Materiais e Provas</h2>
            <div className="dashboard-filtros">
              <select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}>
                <option value="">Todas as disciplinas</option>
                {disciplinasDisponiveis.map((disciplina, idx) => (
                  <option key={idx} value={disciplina}>{disciplina}</option>
                ))}
              </select>
              <select value={filtroSemestre} onChange={(e) => setFiltroSemestre(e.target.value)}>
                <option value="">Todos os semestres</option>
                {semestresDisponiveis.map((semestre, idx) => (
                  <option key={idx} value={semestre}>{semestre}</option>
                ))}
              </select>
              <button type="button" onClick={carregarListas}>Filtrar</button>
            </div>

            <div className="dashboard-list-grid">
              <div>
                <h3>Materiais</h3>
                {materiais.length === 0 ? (
                  <p className="lista-vazia">Nenhum material encontrado.</p>
                ) : (
                  materiais.map((material) => (
                    <article className="dashboard-list-item" key={material.id}>
                      <strong>{material.titulo}</strong>
                      <span>{material.disciplina} · {material.semestre}</span>
                      <small>{material.nomeArquivo || "Sem arquivo"} · {material.professorEmail}</small>
                    </article>
                  ))
                )}
              </div>

              <div>
                <h3>Provas</h3>
                {provas.length === 0 ? (
                  <p className="lista-vazia">Nenhuma prova encontrada.</p>
                ) : (
                  provas.map((prova) => (
                    <article className="dashboard-list-item" key={prova.id}>
                      <strong>{prova.titulo}</strong>
                      <span>{prova.disciplina} · {prova.semestre}</span>
                      <small>{prova.descricao || "Sem descrição"}</small>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
