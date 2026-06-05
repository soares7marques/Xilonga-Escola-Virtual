import React, { useState, useEffect } from 'react';
import './DashboadProf.css';
import { FaUserGraduate, FaChalkboardTeacher,FaBookOpen, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';


const Dashboard = ({ onDisponibilizarMaterial, onCriarProva, onSair }) => {
  // Estado para dados do usuário
  const [usuario, setUsuario] = useState({ email: '', role: '', Ticket: '', SessionKey: '' });
  const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
  const Classes = "7ª"; // valor fixo

  useEffect(() => {

    // Buscar quantidade de alunos
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await fetch('http://localhost:8080/aluno/quantidade', {
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
  
  // Simulação de lista de classes cadastradas
  const [classes, setClasses] = useState([]);
  
  // Listas de disciplinas e semestres
  const disciplinasDisponiveis = [
    "Matemática",
    "Química",
    "Física",
    "Biologia",
    "História",
    "Geografia",
    "Português",
    "Educação Física",
    "Artes",
    "Informática"
  ];
  
  const semestresDisponiveis = ["1º Semestre", "2º Semestre", "3º Semestre"];
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

      if (onDisponibilizarMaterial) {
        await onDisponibilizarMaterial(formData);
      } else {
        // Simulação local quando callback ainda não estiver integrado ao backend
        await new Promise((resolve) => setTimeout(resolve, 700));
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
    } catch (error) {
      setFeedbackUpload({
        tipo: "erro",
        mensagem: "Falha ao enviar vídeo. Tente novamente."
      });
    } finally {
      setEnviandoVideo(false);
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
        <button onClick={onCriarProva}><FaFileAlt style={{marginRight:8}}/>Criar Prova</button>
        <button className="sair" onClick={onSair}><FaSignOutAlt style={{marginRight:8}}/>Sair</button>
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
      </main>
    </div>
  );
};

export default Dashboard;
