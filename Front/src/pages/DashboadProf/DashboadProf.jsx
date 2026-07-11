import React, { useEffect, useMemo, useState } from 'react';
import './DashboadProf.css';
import { FaBookOpen, FaChalkboardTeacher, FaSignOutAlt, FaUserGraduate } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, apiFetch, clearAuthSession, getCurrentUser } from '../../services/api';

const LIMITE_VIDEO_MB = 30;
const LIMITE_VIDEO_BYTES = LIMITE_VIDEO_MB * 1024 * 1024;

const lerErroResposta = async (response) => {
  const texto = await response.text();
  if (!texto) {
    return 'Falha ao enviar vídeo.';
  }

  try {
    const data = JSON.parse(texto);
    return data.message || data.error || texto;
  } catch {
    return texto;
  }
};

const getTrimestreMaterial = (material) => material.trimestre || material.semestre || '';

const Dashboard = ({ onSair }) => {
  const navigate = useNavigate();
  const [usuario] = useState(getCurrentUser());
  const [perfilProfessor, setPerfilProfessor] = useState({ classe: '', disciplina: '', associacoes: [] });
  const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
  const [activeForm, setActiveForm] = useState(null);
  const [mostrarConfirmacaoSaida, setMostrarConfirmacaoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [materialTrimestre, setMaterialTrimestre] = useState('');
  const [materialTitulo, setMaterialTitulo] = useState('');
  const [materialArquivo, setMaterialArquivo] = useState(null);
  const [enviandoVideo, setEnviandoVideo] = useState(false);
  const [feedbackUpload, setFeedbackUpload] = useState({ tipo: '', mensagem: '' });
  const [materiais, setMateriais] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [filtroTrimestre, setFiltroTrimestre] = useState('');
  const [alunosClasse, setAlunosClasse] = useState([]);

  const professorPronto = useMemo(
    () => Boolean(perfilProfessor.classe && perfilProfessor.disciplina),
    [perfilProfessor]
  );

  const carregarPerfilProfessor = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/professor/perfil`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar o perfil do professor.');
      }

      const data = await response.json();
      const associacoes = Array.isArray(data.associacoes) ? data.associacoes : [];
      const associacaoInicial = associacoes[0] || {};
      setPerfilProfessor({
        classe: associacaoInicial.classe || data.classe || '',
        disciplina: associacaoInicial.disciplina || data.disciplina || '',
        associacoes,
        nome: data.nome || '',
        email: data.email || usuario.email
      });
    } catch {
      setFeedbackUpload({
        tipo: 'erro',
        mensagem: 'Não foi possível carregar a classe e a disciplina do professor.'
      });
    }
  };

  const carregarListas = async () => {
    const params = new URLSearchParams();
    if (perfilProfessor.disciplina) {
      params.set('disciplina', perfilProfessor.disciplina);
    }
    if (filtroTrimestre) {
      params.set('trimestre', filtroTrimestre);
    }

    try {
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch(`${API_BASE_URL}/professor/materiais${query}`);
      if (response.ok) {
        const data = await response.json();
        setMateriais(Array.isArray(data) ? data : []);
      }
    } catch {
      setFeedbackUpload({ tipo: 'erro', mensagem: 'Não foi possível carregar os materiais.' });
    }
  };

  const carregarTrimestres = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/professor/trimestres`);
      if (response.ok) {
        const data = await response.json();
        setTrimestres(Array.isArray(data) ? data.map((trimestre) => trimestre.nome || trimestre).filter(Boolean) : []);
      }
    } catch {
      setTrimestres([]);
    }
  };

  const carregarAlunosDaClasse = async () => {
    try {
      const params = new URLSearchParams();
      if (perfilProfessor.classe) {
        params.set('classe', perfilProfessor.classe);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch(`${API_BASE_URL}/professor/alunos${query}`);
      if (response.ok) {
        const data = await response.json();
        setAlunosClasse(Array.isArray(data) ? data : []);
      }
    } catch {
      setAlunosClasse([]);
    }
  };

  useEffect(() => {
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/aluno/quantidade`);
        if (response.ok) {
          const data = await response.json();
          setQuantidadeAlunos(typeof data === 'number' ? data : Number(data));
        }
      } catch {
        setQuantidadeAlunos(0);
      }
    };

    carregarPerfilProfessor();
    carregarTrimestres();
    fetchQuantidadeAlunos();
  }, []);

  useEffect(() => {
    if (perfilProfessor.disciplina) {
      carregarListas();
    }
  }, [perfilProfessor.disciplina, filtroTrimestre]);

  useEffect(() => {
    if (perfilProfessor.classe) {
      carregarAlunosDaClasse();
    }
  }, [perfilProfessor.classe]);

  const handleSair = () => {
    setMostrarConfirmacaoSaida(true);
  };

  const cancelarSaida = () => {
    if (!saindo) {
      setMostrarConfirmacaoSaida(false);
    }
  };

  const confirmarSaida = () => {
    setSaindo(true);
    clearAuthSession();

    setTimeout(() => {
      if (onSair) {
        onSair();
      } else {
        navigate('/login', { replace: true });
      }
    }, 650);
  };

  const handleAssociacaoChange = (valor) => {
    const associacao = perfilProfessor.associacoes.find((item, index) => `${item.classe}|${item.disciplina}|${index}` === valor);
    if (!associacao) {
      return;
    }

    setPerfilProfessor((perfil) => ({
      ...perfil,
      classe: associacao.classe || '',
      disciplina: associacao.disciplina || ''
    }));
    setFiltroTrimestre('');
  };

  const selecionarArquivo = (file) => {
    setFeedbackUpload({ tipo: '', mensagem: '' });

    if (!file) {
      setMaterialArquivo(null);
      return;
    }

    if (!file.type.startsWith('video/')) {
      setMaterialArquivo(null);
      setFeedbackUpload({ tipo: 'erro', mensagem: 'Arquivo inválido. Selecione um vídeo.' });
      return;
    }

    if (file.size > LIMITE_VIDEO_BYTES) {
      setMaterialArquivo(null);
      setFeedbackUpload({ tipo: 'erro', mensagem: `O vídeo deve ter no máximo ${LIMITE_VIDEO_MB} MB.` });
      return;
    }

    setMaterialArquivo(file);
    setFeedbackUpload({ tipo: 'info', mensagem: `Vídeo selecionado: ${file.name}` });
  };

  const handleDisponibilizarMaterial = async (e) => {
    e.preventDefault();
    setFeedbackUpload({ tipo: '', mensagem: '' });

    if (!professorPronto || !materialTrimestre || !materialTitulo || !materialArquivo) {
      setFeedbackUpload({ tipo: 'erro', mensagem: 'Preencha trimestre, título e selecione um vídeo.' });
      return;
    }

    const formData = new FormData();
    formData.append('classe', perfilProfessor.classe);
    formData.append('disciplina', perfilProfessor.disciplina);
    formData.append('trimestre', materialTrimestre);
    formData.append('titulo', materialTitulo);
    formData.append('video', materialArquivo);

    try {
      setEnviandoVideo(true);
      setFeedbackUpload({ tipo: 'info', mensagem: 'A enviar vídeo...' });

      const response = await apiFetch(`${API_BASE_URL}/professor/materiais`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(await lerErroResposta(response));
      }

      setFeedbackUpload({ tipo: 'sucesso', mensagem: `Vídeo "${materialTitulo}" enviado com sucesso.` });
      setMaterialTrimestre('');
      setMaterialTitulo('');
      setMaterialArquivo(null);
      e.target.reset();
      carregarListas();
    } catch (error) {
      setFeedbackUpload({ tipo: 'erro', mensagem: error.message || 'Falha ao enviar vídeo. Tente novamente.' });
    } finally {
      setEnviandoVideo(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ position: 'absolute', top: 10, right: 20, fontSize: '1em', color: '#555' }}>
        <span><strong>{usuario.role}</strong> | {usuario.email}</span>
      </div>

      <aside className="dashboard-sidebar">
        <h2>Menu</h2>
        <button onClick={() => setActiveForm(activeForm === 'material' ? null : 'material')}>
          <FaBookOpen style={{ marginRight: 8 }} />Disponibilizar Material
        </button>
        <button onClick={() => setActiveForm(activeForm === 'listar' ? null : 'listar')}>
          <FaBookOpen style={{ marginRight: 8 }} />Materiais
        </button>
        <button onClick={() => setActiveForm(activeForm === 'alunos' ? null : 'alunos')}>
          <FaUserGraduate style={{ marginRight: 8 }} />Alunos da Classe
        </button>
        <button className="sair" onClick={handleSair}>
          <FaSignOutAlt style={{ marginRight: 8 }} />Sair
        </button>
      </aside>

      <main className="dashboard-main">
        <h1>Dashboard do Professor</h1>
        {perfilProfessor.associacoes.length > 1 && (
          <div className="dashboard-form dashboard-selector">
            <label htmlFor="associacao-professor">Classe e disciplina ativa:</label>
            <select
              id="associacao-professor"
              value={`${perfilProfessor.classe}|${perfilProfessor.disciplina}|${perfilProfessor.associacoes.findIndex((item) => item.classe === perfilProfessor.classe && item.disciplina === perfilProfessor.disciplina)}`}
              onChange={(e) => handleAssociacaoChange(e.target.value)}
            >
              {perfilProfessor.associacoes.map((associacao, index) => (
                <option
                  key={`${associacao.classe}-${associacao.disciplina}-${index}`}
                  value={`${associacao.classe}|${associacao.disciplina}|${index}`}
                >
                  {associacao.classe} - {associacao.disciplina}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaUserGraduate className="dashboard-icon" />
            <span className="dashboard-card-title">Alunos</span>
            <span className="dashboard-card-value">{quantidadeAlunos}</span>
          </div>
          <div className="dashboard-card">
            <FaChalkboardTeacher className="dashboard-icon" />
            <span className="dashboard-card-title">Classe</span>
            <span className="dashboard-card-value texto-card">{perfilProfessor.classe || 'A carregar'}</span>
          </div>
          <div className="dashboard-card">
            <FaBookOpen className="dashboard-icon" />
            <span className="dashboard-card-title">Disciplina</span>
            <span className="dashboard-card-value texto-card">{perfilProfessor.disciplina || 'A carregar'}</span>
          </div>
        </div>

        {activeForm === 'material' && (
          <form className="dashboard-form" onSubmit={handleDisponibilizarMaterial}>
            <h2><FaBookOpen style={{ marginRight: 8 }} />Disponibilizar Vídeo</h2>

            <label htmlFor="classe-input">Classe:</label>
            <input id="classe-input" type="text" value={perfilProfessor.classe} readOnly />

            <label htmlFor="disciplina-input">Disciplina:</label>
            <input id="disciplina-input" type="text" value={perfilProfessor.disciplina} readOnly />

            <label htmlFor="trimestre-select">Trimestre:</label>
            <select
              id="trimestre-select"
              value={materialTrimestre}
              onChange={e => setMaterialTrimestre(e.target.value)}
              required
            >
              <option value="">Selecione o Trimestre</option>
              {trimestres.map((trimestre) => (
                <option key={trimestre} value={trimestre}>{trimestre}</option>
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

            <label htmlFor="video-input">Upload do Vídeo (máx. 30 MB):</label>
            <input
              id="video-input"
              type="file"
              accept="video/*"
              onChange={e => selecionarArquivo(e.target.files?.[0] || null)}
              required
            />

            {feedbackUpload.mensagem && (
              <div className={`feedback-upload ${feedbackUpload.tipo}`}>
                {feedbackUpload.mensagem}
              </div>
            )}

            <button type="submit" disabled={enviandoVideo || !professorPronto}>
              <FaBookOpen style={{ marginRight: 8 }} />
              {enviandoVideo ? 'Enviando vídeo...' : 'Adicionar Vídeo'}
            </button>
          </form>
        )}

        {activeForm === 'listar' && (
          <section className="dashboard-list-panel">
            <h2>Materiais</h2>
            <div className="dashboard-filtros dashboard-filtros-simples">
              <select value={filtroTrimestre} onChange={(e) => setFiltroTrimestre(e.target.value)}>
                <option value="">Todos os trimestres</option>
                {trimestres.map((trimestre) => (
                  <option key={trimestre} value={trimestre}>{trimestre}</option>
                ))}
              </select>
              <button type="button" onClick={carregarListas}>Filtrar</button>
            </div>

            {materiais.length === 0 ? (
              <p className="lista-vazia">Nenhum material encontrado.</p>
            ) : (
              materiais.map((material) => (
                <article className="dashboard-list-item" key={material.id}>
                  <strong>{material.titulo}</strong>
                  <span>{material.classe} · {material.disciplina} · {getTrimestreMaterial(material)}</span>
                  <small>{material.nomeArquivo || 'Sem arquivo'} · {material.professorEmail}</small>
                </article>
              ))
            )}
          </section>
        )}

        {activeForm === 'alunos' && (
          <section className="dashboard-list-panel">
            <h2>Alunos da sua classe</h2>
            <p className="dashboard-subtitle">
              Apenas os alunos da classe <strong>{perfilProfessor.classe || '—'}</strong> aparecem aqui.
            </p>

            {alunosClasse.length === 0 ? (
              <p className="lista-vazia">Nenhum aluno encontrado para a sua classe.</p>
            ) : (
              <div className="alunos-grid">
                {alunosClasse.map((aluno) => (
                  <article className="aluno-card" key={aluno.id}>
                    <strong>{aluno.nome}</strong>
                    <span>{aluno.email}</span>
                    <small>Classe: {aluno.classe}</small>
                    <small>Telefone: {aluno.telefone || '—'}</small>
                    <small>Gênero: {aluno.genero || '—'}</small>
                    <small>Pontuação: {aluno.pontuacao ?? '0'}</small>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {mostrarConfirmacaoSaida && (
        <div className="dashboard-logout-overlay" role="dialog" aria-modal="true" aria-labelledby="professor-logout-title">
          <div className="dashboard-logout-modal">
            <span className="dashboard-logout-icon" aria-hidden="true">
              <FaSignOutAlt />
            </span>
            <h2 id="professor-logout-title">Terminar sessão?</h2>
            <p>Ao sair do painel do professor, será necessário fazer login novamente para disponibilizar materiais.</p>

            {saindo && <span className="dashboard-logout-status">A terminar sessão...</span>}

            <div className="dashboard-logout-actions">
              <button type="button" className="dashboard-logout-cancel" onClick={cancelarSaida} disabled={saindo}>
                Cancelar
              </button>
              <button type="button" className="dashboard-logout-confirm" onClick={confirmarSaida} disabled={saindo}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
