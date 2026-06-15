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

const getInitialEmail = (stateData = {}) => {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem('userData')) || {};
    return stateData.Email || stateData.email || sessionData.Email || sessionData.email || '';
  } catch {
    return stateData.Email || stateData.email || '';
  }
};

const getSavedPhoto = () => {
  try {
    return localStorage.getItem('perfilFoto') || '';
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
    foto: getSavedPhoto(),
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
        localStorage.setItem('perfilFoto', foto);
      } catch {
        // Mantém a foto na sessão mesmo se o navegador bloquear o localStorage.
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setEstudante((prev) => ({
      ...prev,
      email,
    }));

    const fetchPerfil = async () => {
      setEstadoPerfil('loading');
      setErroPerfil('');

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

        setEstudante((prev) => ({
          ...prev,
          nome: data.nome || data.Nome || prev.nome,
          contacto: data.contacto || data.Contacto || prev.contacto,
          email: data.email || data.Email || prev.email,
          genero: data.genero || data.Genero || prev.genero,
          classe: data.classe || data.Classe || 'Não inscrito',
          pontuacao: data.pontuacao || data.Pontuacao || prev.pontuacao,
        }));
        setEstadoPerfil('success');
      } catch {
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
  }, [email]);

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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Perfil;
