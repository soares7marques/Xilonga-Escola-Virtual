import React, { useState, useEffect } from 'react';

import './Perfil.css';
import Navbar from '../../components/NavBarAula/NavbarAula';
import Footer from '../../components/Footer/Footer';
import '../../App.css';


const Perfil = () => {
  let sessionData = {};
  try {
    sessionData = JSON.parse(sessionStorage.getItem('userData')) || {};
  } catch (e) {}

  const email = sessionData.Email || sessionData.email;

  const [estudante, setEstudante] = useState({
    foto: '', // URL ou base64 da foto do estudante
    nome: 'João Silva',
    contacto: '+244 923 456 789',
    email: email,
    classe: '7ª classe',
  });

  const fileInputRef = React.useRef(null);

  const [disciplinaProgress, setDisciplinaProgress] = useState([]);
  const [totalAssistidas, setTotalAssistidas] = useState(0);

  const handleFotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEstudante((prev) => ({ ...prev, foto: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Buscar perfil e agrupar progresso
  useEffect(() => {
    setEstudante((prev) => ({
      ...prev,
      email: email
    }));

    const fetchPerfil = async () => {
      try {
        const response = await fetch(`http://localhost:8080/aluno/perfil?email=${encodeURIComponent(email)}`,
          {
        headers: {
          'Content-Type': 'application/json',
        },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEstudante((prev) => ({
            ...prev,
            nome: data.nome || prev.nome,
            contacto: data.contacto || prev.contacto,
            email: data.email || prev.email,
            classe: data.classe || prev.classe,
          }));
        }
      } catch (e) {
        // erro silencioso
      }
    };

    if (email) {
      fetchPerfil();
    }

    // Agrupar progresso por disciplina-semestre a partir das chaves em localStorage
    try {
      const videos = JSON.parse(localStorage.getItem('videosAssistidos') || '{}');
      const groups = {};
      Object.keys(videos).forEach((key) => {
        // espera chave no formato "Disciplina-Semestre-id"
        const parts = key.split('-');
        if (parts.length >= 3 && videos[key] === true) {
          const disciplina = parts[0].trim();
          const semestre = parts[1].trim();
          const label = `${disciplina} - ${semestre}`;
          groups[label] = (groups[label] || 0) + 1;
        }
      });
      const progArray = Object.keys(groups).map((k) => ({ nome: k, count: groups[k] }));
      setDisciplinaProgress(progArray);
      const total = progArray.reduce((s, p) => s + p.count, 0);
      setTotalAssistidas(total);
    } catch (e) {
      setDisciplinaProgress([]);
      setTotalAssistidas(0);
    }
  }, [email]);

  const maxCount = disciplinaProgress.length ? Math.max(...disciplinaProgress.map(d => d.count)) : 1;

  return (
    <div className="perfil-container">
      <Navbar />
      <main className="perfil-main">
        <section className="perfil-dados">
          <div className="perfil-foto">
            <img
              src={estudante.foto || '/imagem/Equipa.png'} // Foto ou imagem padrão
              alt="Foto do estudante"
              style={{ cursor: 'pointer' }}
              onClick={handleFotoClick}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFotoChange}
            />
            <p style={{ fontSize: '0.9em', color: '#888', marginTop: '8px' }}>Clique na foto para alterar</p>
          </div>
          <div className="perfil-info">
            <h2>Dados do Estudante</h2>
            <p><strong>Nome:</strong> {estudante.nome}</p>
            <p><strong>Contacto:</strong> {estudante.contacto}</p>
            <p><strong>Email:</strong> {estudante.email}</p>
            <p><strong>Classe:</strong> {estudante.classe}</p>
          </div>

          <div className="perfil-progress">
            <h3>Progresso por Disciplina</h3>
            <p className="total-assistidas">Total aulas assistidas: {totalAssistidas}</p>
            <div className="progress-list">
              {disciplinaProgress.length === 0 ? (
                <p className="nenhuma-atividade">Nenhuma atividade registrada</p>
              ) : (
                disciplinaProgress.map((item) => (
                  <div className="progress-row" key={item.nome}>
                    <div className="progress-label">{item.nome}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }} />
                    </div>
                    <div className="progress-count">{item.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </main>
       <Footer />
    </div>
  );
};

export default Perfil;
