// src/pages/AreasDeEstudo.jsx

import React, { useState, useEffect } from 'react';
import './AreasDeEstudo.css';
import NavbarArea from '../../components/NavbarArea/NavbarArea';
import Footer from '../../components/Footer/Footer';
import '../../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaCheckCircle, FaGraduationCap, FaSearch, FaUsers } from 'react-icons/fa';
import { API_BASE_URL, apiFetch } from '../../services/api';

const areasFallback = [
  {
    id: 1,
    nome: '7ª Classe',
    descricao: 'Base para reforçar leitura, cálculo, ciências e hábitos de estudo.',
    imagem: '/imagem/escola1.jpeg',
    disciplinas: ['Português', 'Matemática', 'Física', 'Química'],
    cor: '#5cd8d0',
    nivel: 'Primeiro nível',
    estatisticas: { estudantes: 0, modulos: 4, taxa_sucesso: 0 },
    passos: ['Assistir aula introdutória', 'Organizar plano semanal', 'Resolver simulado diagnóstico']
  },
  {
    id: 2,
    nome: '8ª Classe',
    descricao: 'Continuidade para ganhar ritmo, autonomia e confiança nas disciplinas-chave.',
    imagem: '/imagem/escola2.jpeg',
    disciplinas: ['Português', 'Matemática', 'Física', 'Química'],
    cor: '#7be6df',
    nivel: 'Segundo nível',
    estatisticas: { estudantes: 0, modulos: 4, taxa_sucesso: 0 },
    passos: ['Rever conteúdos essenciais', 'Baixar material de apoio', 'Acompanhar progresso no perfil']
  },
];

const calcularResumo = (areas) => {
  const totalModulos = areas.reduce((total, area) => total + Number(area.estatisticas?.modulos || 0), 0);
  const totalEstudantes = areas.reduce((total, area) => total + Number(area.estatisticas?.estudantes || 0), 0);
  const mediaSucesso = areas.length === 0
    ? 0
    : Math.round(
      areas.reduce((total, area) => total + Number(area.estatisticas?.taxa_sucesso || 0), 0) / areas.length
    );

  return {
    classesDisponiveis: areas.length,
    estudantesInscritos: totalEstudantes,
    modulosEstudo: totalModulos,
    taxaMediaSucesso: mediaSucesso
  };
};

const AreasDeEstudo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Recupera dados do usuário do state (navegação) ou sessionStorage
  let stateData = location.state || {};
  let storageData = {};
  try {
    storageData = JSON.parse(sessionStorage.getItem('userData')) || {};
  } catch {
    storageData = {};
  }
  const email = stateData.email || storageData.email;

  const [selectedArea, setSelectedArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areas, setAreas] = useState(areasFallback);
  const [resumo, setResumo] = useState(calcularResumo(areasFallback));
  const [carregandoAreas, setCarregandoAreas] = useState(true);
  const [usandoFallback, setUsandoFallback] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [mensagemTipo, setMensagemTipo] = useState(''); // 'sucesso' ou 'erro'

  useEffect(() => {
    
    // Animar cards quando carrega a página
    setTimeout(() => setAnimateCards(true), 300);
  }, [email]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setCarregandoAreas(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.set('pesquisa', searchTerm.trim());
        }

        const response = await apiFetch(`${API_BASE_URL}/area-estudo?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar áreas de estudo.');
        }

        const data = await response.json();
        const areasRecebidas = Array.isArray(data.areas) ? data.areas : [];
        setAreas(areasRecebidas);
        setResumo(data.resumo || calcularResumo(areasRecebidas));
        setUsandoFallback(false);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        const areasFiltradas = areasFallback.filter(area =>
          area.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          area.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          area.disciplinas.some(disc => disc.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setAreas(areasFiltradas);
        setResumo(calcularResumo(areasFiltradas));
        setUsandoFallback(true);
      } finally {
        setCarregandoAreas(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  // Função para inscrever-se
  const handleInscrever = async (nivel) => {
    const dadosEnvio = {
      classe: nivel,
      email: email
    };
    console.log('Dados enviados para inscrição:', dadosEnvio);
    try {
      const response = await apiFetch(`${API_BASE_URL}/aluno/inscricao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch {
      setMensagem('Erro de conexão com o servidor.');
      setMensagemTipo('erro');
    }
  };


  const filteredAreas = areas;

  return (
    <div className="areas-de-estudo-container">
      <NavbarArea />

      {mensagem && (
        <div className={`mensagem-feedback ${mensagemTipo}`}>{mensagem}</div>
      )}

      <main className="areas-main">
        <section className="areas-hero">
          <div className="areas-hero-content">
            <span className="areas-eyebrow">Área de estudo</span>
            <h1>Escolha a classe certa para continuar a aprender</h1>
            <p>
              Encontre o nível que combina com o seu percurso, veja as disciplinas disponíveis
              e faça a inscrição para começar a estudar.
            </p>
          </div>

          <div className="areas-search-panel">
            <label htmlFor="area-search">Pesquisar classe ou disciplina</label>
            <div className="search-container">
              <FaSearch aria-hidden="true" />
              <input
                id="area-search"
                type="search"
                placeholder="Ex.: 7ª Classe, Matemática..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="stats-grid" aria-label="Resumo das áreas disponíveis">
          <div className="stat-item">
            <FaGraduationCap aria-hidden="true" />
            <div>
              <span className="stat-number">{resumo.classesDisponiveis}</span>
              <span className="stat-label">classes disponíveis</span>
            </div>
          </div>
          <div className="stat-item">
            <FaUsers aria-hidden="true" />
            <div>
              <span className="stat-number">{Number(resumo.estudantesInscritos || 0).toLocaleString('pt-PT')}</span>
              <span className="stat-label">estudantes inscritos</span>
            </div>
          </div>
          <div className="stat-item">
            <FaBookOpen aria-hidden="true" />
            <div>
              <span className="stat-number">{resumo.modulosEstudo}</span>
              <span className="stat-label">módulos de estudo</span>
            </div>
          </div>
          <div className="stat-item">
            <FaCheckCircle aria-hidden="true" />
            <div>
              <span className="stat-number">{resumo.taxaMediaSucesso}%</span>
              <span className="stat-label">taxa média de sucesso</span>
            </div>
          </div>
        </section>

      <section className="cards-section">
        <div className="section-heading">
          <div>
            <span>Classes</span>
            <h2>Aprendizagem organizada por nível</h2>
          </div>
          <p>{carregandoAreas ? 'A carregar...' : `${filteredAreas.length} resultado(s) encontrado(s)`}</p>
        </div>
        {usandoFallback && (
          <div className="areas-api-status">
            Não foi possível carregar os dados do servidor. A mostrar dados temporários.
          </div>
        )}
        <div className="cards-grid">
          {filteredAreas.map((area, index) => (
            <div
              key={area.id}
              className={`area-card ${animateCards ? 'animate' : ''}`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                '--area-color': area.cor
              }}
              onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
            >
              <div className="card-image">
                <img src={area.imagem} alt={area.nome} />
                <span>{area.nivel}</span>
              </div>
              <div className="card-content">
                <h3>{area.nome}</h3>
                <p>{area.descricao}</p>
                <div className="card-stats">
                  <span><FaUsers aria-hidden="true" /> {area.estatisticas.estudantes.toLocaleString('pt-PT')} estudantes</span>
                  <span><FaBookOpen aria-hidden="true" /> {area.estatisticas.modulos} módulos</span>
                  <span><FaCheckCircle aria-hidden="true" /> {area.estatisticas.taxa_sucesso}% sucesso</span>
                </div>
                <div className="disciplinas-list">
                  {area.disciplinas.map((disc, idx) => (
                    <span key={idx} className="disciplina-tag">
                      {disc}
                    </span>
                  ))}
                </div>
                <button className="btn-inscrever" type="button">
                  {selectedArea === area.id ? 'Ocultar detalhes' : 'Saber mais'}
                </button>
                {selectedArea === area.id && (
                  <div className="card-details">
                    <h4>Próximos Passos:</h4>
                    <ul>
                      {area.passos.map((passo) => (
                        <li key={passo}>{passo}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="all-areas-section">
        <div className="section-heading">
          <div>
            <span>Inscrição</span>
            <h2>Todos os níveis de estudo</h2>
          </div>
        </div>
        <div className="areas-list">
          {filteredAreas.map((area) => (
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
              <button className="btn-ver" type="button" onClick={() => handleInscrever(area.nome)}>
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
      </main>
      <Footer />
    </div>
  );
};

export default AreasDeEstudo;
