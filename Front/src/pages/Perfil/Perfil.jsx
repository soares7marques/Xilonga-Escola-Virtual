import React, { useEffect, useRef, useState } from 'react';

import './Perfil.css';
import Navbar from '../../components/NavBarAula/NavbarAula';
import Footer from '../../components/Footer/Footer';
import '../../App.css';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL, apiFetch } from '../../services/api';

const DEFAULT_STUDENT = {
  foto: '',
  nome: 'Estudante',
  contacto: 'Não informado',
  email: '',
  genero: 'Não informado',
  classe: 'Não inscrito',
  pontuacao: '0',
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

const safeParseJSON = (value, fallback) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

const getVideosAssistidos = () => {
  try {
    return safeParseJSON(localStorage.getItem('videosAssistidos') || '{}', {});
  } catch {
    return {};
  }
};

const getVideoKey = (disciplina, semestre, materialId) => `${disciplina}-${semestre}-material-${materialId}`;

const getInitialEmail = (stateData = {}) => {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem('userData')) || {};
    return stateData.Email || stateData.email || sessionData.Email || sessionData.email || '';
  } catch {
    return stateData.Email || stateData.email || '';
  }
};

const getSavedPhoto = (email) => {
  try {
    return localStorage.getItem(`perfilFoto_${email}`) || '';
  } catch {
    return '';
  }
};

const Perfil = () => {
  const location = useLocation();
  const email = getInitialEmail(location.state || {});
  const fileInputRef = useRef(null);

  const [estudante, setEstudante] = useState({
    ...DEFAULT_STUDENT,
    email,
    foto: getSavedPhoto(email),
  });
  const [resumoPontuacao, setResumoPontuacao] = useState({
    total: 0,
    disciplinas: [],
    videosAssistidos: 0,
    videosTotais: 0,
    carregando: false,
    erro: '',
  });
  const [estadoPerfil, setEstadoPerfil] = useState('idle');
  const [erroPerfil, setErroPerfil] = useState('');

  const handleFotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const foto = e.target.result;
      setEstudante((prev) => ({ ...prev, foto }));

      try {
        localStorage.setItem(`perfilFoto_${email}`, foto);
      } catch {
        // Mantém a foto na sessão mesmo se o navegador bloquear o localStorage.
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let cancelado = false;

    setEstudante((prev) => ({
      ...prev,
      email,
    }));

    const carregarResumoPontuacao = async () => {
      setResumoPontuacao((prev) => ({
        ...prev,
        carregando: true,
        erro: '',
      }));

      const response = await apiFetch(`${API_BASE_URL}/aluno/progresso?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error('Não foi possível carregar a pontuação do perfil.');
      }

      const data = await response.json();

      return {
        total: Number(data.total || 0),
        disciplinas: Array.isArray(data.disciplinas) ? data.disciplinas : [],
        videosAssistidos: Number(data.videosAssistidos || 0),
        videosTotais: Number(data.videosTotais || 0),
        carregando: false,
        erro: '',
      };
    };

    const fetchPerfil = async () => {
      setEstadoPerfil('loading');
      setErroPerfil('');
      setResumoPontuacao((prev) => ({
        ...prev,
        carregando: true,
        erro: '',
      }));

      try {
        const response = await apiFetch(
          `${API_BASE_URL}/aluno/perfil?email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
          }
        );

        console.log("Status:", response.status);
        console.log("StatusText:", response.statusText);
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar os dados do perfil.');
        }

        const data = await response.json();
        const classeAtual = data.classe || data.Classe || 'Não inscrito';
        const resumoPontuacaoCalculado = await carregarResumoPontuacao();

        if (cancelado) {
          return;
        }

        setEstudante((prev) => ({
          ...prev,
          nome: data.nome || data.Nome || prev.nome,
          contacto: data.contacto || data.Contacto || prev.contacto,
          email: data.email || data.Email || prev.email,
          genero: data.genero || data.Genero || prev.genero,
          classe: classeAtual,
          pontuacao: data.pontuacao || data.Pontuacao || prev.pontuacao,
        }));
        setResumoPontuacao(resumoPontuacaoCalculado);
        setEstadoPerfil('success');
      } catch {
        if (!cancelado) {
          setResumoPontuacao((prev) => ({
            ...prev,
            carregando: false,
            erro: 'Não foi possível calcular a pontuação agora.',
          }));
        }
        setErroPerfil('Não foi possível atualizar os dados agora.');
        setEstadoPerfil('error');
      }
    };

    if (!email) {
      setEstadoPerfil('error');
      setErroPerfil('Faça login para carregar os dados do perfil.');
    } else {
      fetchPerfil();
    }

    return () => {
      cancelado = true;
    };
  }, [email]);

  const disciplinaQtd = resumoPontuacao.disciplinas.length;
  const mediaPontuacao = disciplinaQtd > 0 ? Math.round(resumoPontuacao.total / disciplinaQtd) : 0;

  return (
    <div className="perfil-container">
      <Navbar />
      <main className="perfil-main">
        <section className="perfil-hero" aria-labelledby="perfil-title">
          <div className="perfil-avatar-area">
            <button
              className="perfil-avatar-button"
              type="button"
              onClick={handleFotoClick}
              aria-label="Alterar foto do estudante"
            >
              <img
                src={estudante.foto || '/imagem/Equipa.png'}
                alt="Foto do estudante"
              />
              <span className="avatar-camera" aria-hidden="true">
                <i className="fas fa-camera"></i>
              </span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="perfil-file-input"
              onChange={handleFotoChange}
            />
          </div>

          <div className="perfil-hero-info">
            <p className="perfil-eyebrow">Perfil do estudante</p>
            <h1 id="perfil-title">{estudante.nome}</h1>
            <p>{estudante.classe} · {estudante.email || 'Email não informado'}</p>
            {estadoPerfil === 'loading' && (
              <span className="perfil-status">Atualizando dados...</span>
            )}
            {estadoPerfil === 'error' && erroPerfil && (
              <span className="perfil-status perfil-status-error">{erroPerfil}</span>
            )}
          </div>
        </section>

        <section className="perfil-stats" aria-label="Resumo de desempenho">
          <article className="perfil-stat">
            <span className="stat-icon" aria-hidden="true">
              <i className="fas fa-star"></i>
            </span>
            <div>
              <strong>{resumoPontuacao.carregando ? '...' : numberFormatter.format(resumoPontuacao.total)}</strong>
              <span>Pontuação acumulada</span>
            </div>
          </article>

          <article className="perfil-stat">
            <span className="stat-icon" aria-hidden="true">
              <i className="fas fa-book"></i>
            </span>
            <div>
              <strong>{resumoPontuacao.carregando ? '...' : disciplinaQtd}</strong>
              <span>Disciplinas avaliadas</span>
            </div>
          </article>

          <article className="perfil-stat">
            <span className="stat-icon" aria-hidden="true">
              <i className="fas fa-play-circle"></i>
            </span>
            <div>
              <strong>{resumoPontuacao.carregando ? '...' : numberFormatter.format(resumoPontuacao.videosAssistidos)}</strong>
              <span>Vídeos assistidos</span>
            </div>
          </article>
        </section>

        <section className="perfil-content">
          <article className="perfil-card perfil-info-card">
            <div className="section-heading">
              <div>
                <p className="perfil-eyebrow">Dados pessoais</p>
                <h2>Informações do estudante</h2>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span>Nome</span>
                <strong>{estudante.nome}</strong>
              </div>
              <div className="info-item">
                <span>Contacto</span>
                <strong>{estudante.contacto}</strong>
              </div>
              <div className="info-item">
                <span>Email</span>
                <strong>{estudante.email || 'Não informado'}</strong>
              </div>
              <div className="info-item">
                <span>Género</span>
                <strong>{estudante.genero || 'Não informado'}</strong>
              </div>
              <div className="info-item">
                <span>Classe</span>
                <strong>{estudante.classe}</strong>
              </div>
            </div>
          </article>

          <article className="perfil-card perfil-progress-card">
            <div className="section-heading">
              <div>
                <p className="perfil-eyebrow">Desempenho</p>
                <h2>Pontuação por disciplina</h2>
              </div>
              <div className="progress-highlight">
                <strong>{resumoPontuacao.carregando ? '...' : numberFormatter.format(resumoPontuacao.total)}</strong>
                <span>Soma dos progressos</span>
              </div>
            </div>

            {resumoPontuacao.erro && (
              <span className="perfil-status perfil-status-error">{resumoPontuacao.erro}</span>
            )}

            {resumoPontuacao.carregando ? (
              <div className="empty-state">
                <p>A calcular o progresso das disciplinas...</p>
              </div>
            ) : resumoPontuacao.disciplinas.length > 0 ? (
              <div className="progress-list">
                {resumoPontuacao.disciplinas.map((disciplina) => (
                  <div className="progress-row" key={disciplina.nome}>
                    <div className="progress-row-top">
                      <span className="progress-label">{disciplina.nome}</span>
                      <strong>{disciplina.progresso}%</strong>
                    </div>
                    <div className="progress-bar" aria-hidden="true">
                      <div
                        className="progress-fill"
                        style={{ width: `${disciplina.progresso}%` }}
                      ></div>
                    </div>
                    <span className="progress-meta">
                      {disciplina.videosVistos} de {disciplina.totalVideos} vídeos concluídos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Sem progresso registrado ainda.</p>
              </div>
            )}

            {!resumoPontuacao.carregando && disciplinaQtd > 0 && (
              <p className="progress-note">
                Média por disciplina: {mediaPontuacao}%
              </p>
            )}
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Perfil;
