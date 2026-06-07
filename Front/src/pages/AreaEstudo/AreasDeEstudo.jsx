// src/pages/AreasDeEstudo.jsx

import React, { useState, useEffect } from 'react';
import './AreasDeEstudo.css';
import NavbarArea from '../../components/NavbarArea/NavbarArea';
import Footer from '../../components/Footer/Footer';
import '../../App.css';
import { useLocation, useNavigate } from 'react-router-dom';

const AreasDeEstudo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Recupera dados do usuário do state (navegação) ou sessionStorage
  let stateData = location.state || {};
  let storageData = {};
  try {
    storageData = JSON.parse(sessionStorage.getItem('userData')) || {};
  } catch (e) {}
  const email = stateData.email || storageData.email;

  const [selectedArea, setSelectedArea] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [mensagemTipo, setMensagemTipo] = useState(''); // 'sucesso' ou 'erro'

  useEffect(() => {
    
    // Animar cards quando carrega a página
    setTimeout(() => setAnimateCards(true), 300);
  }, [email]);

  // Função para inscrever-se
  const handleInscrever = async (nivel) => {
    const dadosEnvio = {
      classe: nivel,
      email: email
    };
    console.log('Dados enviados para inscrição:', dadosEnvio);
    try {
      const response = await fetch('http://localhost:8080/aluno/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        body: JSON.stringify(dadosEnvio)
      });
      const data = await response.json();

        if (data.success) {

          setMensagem(data.message);
          setMensagemTipo('sucesso');

          setTimeout(() => {
            setMensagem('');
            setMensagemTipo('');
            navigate('/perfil', { state: { email } });
          }, 2000);

        } else {

          setMensagem(data.error || 'Erro ao realizar inscrição.');
          setMensagemTipo('erro');

        }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor.');
      setMensagemTipo('erro');
    }
  };


  const classes = [
    {
      id: 1,
      nome: '7ª Classe',
      descricao: 'Estudando o primeiro nível',
      imagem: '/imagem/escola1.jpeg',
      disciplinas: ['Portugues', 'Física', 'Química', 'Mátematica','...'],
      cor: '#4CAF50',
      estatisticas: { estudantes: 1250, modulos: 24, taxa_sucesso: 87 }
    },
    {
      id: 2,
      nome: '8ª Classe',
      descricao: 'Estudando o segundo nível',
      imagem: '/imagem/escola2.jpeg',
      disciplinas: ['Portugues', 'Física', 'Química', 'Mátematica','...'],
      cor: '#2196F3',
      estatisticas: { estudantes: 980, modulos: 18, taxa_sucesso: 92 }
    },
  ];

  const todasAreas = [
    {
      id: 3,
      nome: '7ª Classe',
      descricao: 'Estudando o primeiro nível',
      imagem: '/imagem/escola1.jpeg',
      disciplinas: ['Portugues', 'Física', 'Química', 'Mátematica','...'],
      cor: '#9C27B0'
    },
    {
      id: 4,
      nome: '8ª Classe',
      descricao: 'Estudando o segundo nível',
      imagem: '/imagem/escola2.jpeg',
      disciplinas: ['Portugues', 'Física', 'Química', 'Mátematica...','...'],
      cor: '#607D8B'
    },

  ];

  const filteredAreas = todasAreas.filter(area =>
    area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.disciplinas.some(disc => disc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="areas-de-estudo-container">
      <NavbarArea />

      {/* Mensagem personalizada */}
      {mensagem && (
        <div className={`mensagem-feedback ${mensagemTipo}`}>{mensagem}</div>
      )}

      <section className="cards-section">
        <h2>Classes</h2>
        <div className="cards-grid">
          {filteredAreas.map((area, index) => (
            <div
              key={area.id}
              className={`area-card ${animateCards ? 'animate' : ''} ${hoveredCard === area.id ? 'hovered' : ''}`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                '--area-color': area.cor
              }}
              onMouseEnter={() => setHoveredCard(area.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
            >
              <div className="card-image">
                <img src={area.imagem} alt={area.nome} />
              </div>
              <div className="card-content">
                <h3>{area.nome}</h3>
                <p>{area.descricao}</p>
                <div className="disciplinas-list">
                  {area.disciplinas.map((disc, idx) => (
                    <span key={idx} className="disciplina-tag">
                      {disc}
                    </span>
                  ))}
                </div>
                <button className="btn-inscrever">
                  Saber Mais
                </button>
                {/* Painel Expansível */}
                {selectedArea === area.id && (
                  <div className="card-details">
                    <h4>Próximos Passos:</h4>
                    <ul>
                      <li>Assistir aula introdutória</li>
                      <li>Baixar material de estudo</li>
                      <li>Resolver simulado</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Todas as Áreas */}
      <section className="all-areas-section">
        <h3>Todas os nívies de estudo</h3>
        <div className="areas-list">
          {filteredAreas.map((area, index) => (
            <div key={area.id} className="area-item">
              <img src={area.imagem} alt={area.nome} className="area-icon" />
              <div className="area-info">
                <h4>{area.nome}</h4>
                <p>{area.descricao}</p>
                <div className="disciplinas-small">
                  {area.disciplinas.map((disc, idx) => (
                    <span key={idx}>{disc}</span>
                  ))}
                </div>
              </div>
              <button className="btn-ver" onClick={() => handleInscrever(area.nome)}>
                Inscrever-se
              </button>
            </div>
          ))}
        </div>

        {filteredAreas.length === 0 && (
          <div className="no-results">
            <p>Nenhuma área encontrada. Tente pesquisar por outro termo.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default AreasDeEstudo;