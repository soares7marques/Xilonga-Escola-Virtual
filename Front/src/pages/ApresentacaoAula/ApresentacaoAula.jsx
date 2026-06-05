import React, { useState } from "react";
import Navbar from "../../components/NavBarAula/NavbarAula";
import Footer from "../../components/Footer/Footer";
import "./ApresentacaoAula.css";

const ApresentacaoAula = () => {
  const [disciplinaSelected, setDisciplinaSelected] = useState(null);
  const [semestreSelected, setSemestreSelected] = useState(null);
  const [videoSelected, setVideoSelected] = useState(null);
  const [videosAssistidos, setVideosAssistidos] = useState({});

  const disciplinas = [
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

  const semestres = ["1º Semestre", "2º Semestre", "3º Semestre"];

  const videos = {
    "Matemática": {
      "1º Semestre": [
        { id: 1, titulo: "Números Inteiros", youtubeId: "dQw4w9WgXcQ" },
        { id: 2, titulo: "Operações Básicas", youtubeId: "jNQXAC9IVRw" },
        { id: 3, titulo: "Frações", youtubeId: "9bZkp7q19f0" }
      ],
      "2º Semestre": [
        { id: 4, titulo: "Equações do 1º Grau", youtubeId: "kffacxfA7g4" },
        { id: 5, titulo: "Geometria Básica", youtubeId: "lWMF1p2e2RU" },
        { id: 6, titulo: "Perímetro e Área", youtubeId: "DPo0L8OB4ik" }
      ],
      "3º Semestre": [
        { id: 7, titulo: "Proporção e Escala", youtubeId: "sKcMCdFPiHs" },
        { id: 8, titulo: "Probabilidade", youtubeId: "rYQzLIi4JLM" },
        { id: 9, titulo: "Estatística", youtubeId: "qSRlvH-1tKA" }
      ]
    },
    "Química": {
      "1º Semestre": [
        { id: 10, titulo: "Introdução à Química", youtubeId: "vtUyfR_sWpo" },
        { id: 11, titulo: "Átomos e Moléculas", youtubeId: "Y1EyB-rz6us" },
        { id: 12, titulo: "Tabela Periódica", youtubeId: "pKqGVeyhePE" }
      ],
      "2º Semestre": [
        { id: 13, titulo: "Ligações Químicas", youtubeId: "U4F8VDlJvt0" },
        { id: 14, titulo: "Reações Químicas", youtubeId: "qZbIp1IddDc" },
        { id: 15, titulo: "Balanceamento de Equações", youtubeId: "Q3t8gUYnSQQ" }
      ],
      "3º Semestre": [
        { id: 16, titulo: "pH e Basicidade", youtubeId: "iVeQB4vYZLk" },
        { id: 17, titulo: "Oxidação e Redução", youtubeId: "Q1W8r20KzVo" },
        { id: 18, titulo: "Química Orgânica", youtubeId: "6RHMv_0v5e4" }
      ]
    },
    "Física": {
      "1º Semestre": [
        { id: 19, titulo: "Movimento e Velocidade", youtubeId: "TIp1WDnYd0I" },
        { id: 20, titulo: "Aceleração", youtubeId: "EFd7EzHDGAE" },
        { id: 21, titulo: "Força e Leis de Newton", youtubeId: "kKKM8Y-u7f4" }
      ],
      "2º Semestre": [
        { id: 22, titulo: "Trabalho e Energia", youtubeId: "v78bfVlUJNE" },
        { id: 23, titulo: "Potência", youtubeId: "l7qKoMMtdYo" },
        { id: 24, titulo: "Termologia", youtubeId: "wVYqAvtlkX4" }
      ],
      "3º Semestre": [
        { id: 25, titulo: "Ondas", youtubeId: "4K5WbHhTKcc" },
        { id: 26, titulo: "Som e Luz", youtubeId: "JXFjLd-TZ-8" },
        { id: 27, titulo: "Óptica Geométrica", youtubeId: "Xn-0cX2dZvA" }
      ]
    }
  };

  // Adicionar dados padrão para outras disciplinas
  const disciplinasData = {};
  disciplinas.forEach(disciplina => {
    if (!videos[disciplina]) {
      disciplinasData[disciplina] = {
        "1º Semestre": [
          { id: 1, titulo: "Aula 1 - Introdução", youtubeId: "fJsG3fkDFNI" },
          { id: 2, titulo: "Aula 2 - Conceitos", youtubeId: "2IoxmXqJ6_c" },
          { id: 3, titulo: "Aula 3 - Aplicação", youtubeId: "7qT2LoC-cKU" }
        ],
        "2º Semestre": [
          { id: 4, titulo: "Aula 4 - Aprofundamento", youtubeId: "9VqhINDHMYE" },
          { id: 5, titulo: "Aula 5 - Prática", youtubeId: "2p_8gx-XP04" },
          { id: 6, titulo: "Aula 6 - Avaliação", youtubeId: "XJf-5ACM4x0" }
        ],
        "3º Semestre": [
          { id: 7, titulo: "Aula 7 - Revisão", youtubeId: "Af0u3j-h3VI" },
          { id: 8, titulo: "Aula 8 - Consolidação", youtubeId: "IWnKhI0VzCY" },
          { id: 9, titulo: "Aula 9 - Conclusão", youtubeId: "EKfvKLwcfOU" }
        ]
      };
    }
  });

  const todosVideos = { ...videos, ...disciplinasData };

  const handleDisciplinaClick = (disciplina) => {
    setDisciplinaSelected(disciplina);
    setSemestreSelected(null);
    setVideoSelected(null);
  };

  const handleSemestreClick = (semestre) => {
    setSemestreSelected(semestre);
    setVideoSelected(null);
  };

  const handleVideoClick = (video) => {
    setVideoSelected(video);
    // Marcar vídeo como assistido
    const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
    setVideosAssistidos(prev => ({
      ...prev,
      [chaveVideo]: true
    }));
  };

  // Verificar se todas as aulas do semestre foram assistidas
  const verificarTodasAulasAssistidas = () => {
    const aulasDoSemestre = todosVideos[disciplinaSelected][semestreSelected];
    return aulasDoSemestre.every(video => {
      const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
      return videosAssistidos[chaveVideo] === true;
    });
  };

  // Calcular progresso
  const calcularProgresso = () => {
    const aulasDoSemestre = todosVideos[disciplinaSelected][semestreSelected];
    const assistidas = aulasDoSemestre.filter(video => {
      const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
      return videosAssistidos[chaveVideo] === true;
    }).length;
    return Math.round((assistidas / aulasDoSemestre.length) * 100);
  };

  const handleFazerProva = () => {
    alert(`Iniciando prova de ${disciplinaSelected} - ${semestreSelected}!\n\nVocê assistiu todas as aulas deste semestre.`);
    // Aqui você pode redirecionar para a página de prova ou abrir um modal
  };

  const handleVoltar = () => {
    if (videoSelected) {
      setVideoSelected(null);
    } else if (semestreSelected) {
      setSemestreSelected(null);
    } else {
      setDisciplinaSelected(null);
    }
  };

  return (
    <div className="apresentacao-aula">
      <Navbar />
      <div className="conteudo-aula">
        {!disciplinaSelected ? (
          // Tela de Disciplinas
          <div className="area-estudo">
            <h2>7ª Classe - Disciplinas</h2>
            <div className="disciplinas">
              {disciplinas.map((disciplina, index) => (
                <button 
                  key={index} 
                  className="disciplina-btn"
                  onClick={() => handleDisciplinaClick(disciplina)}
                >
                  {disciplina}
                </button>
              ))}
            </div>
          </div>
        ) : !semestreSelected ? (
          // Tela de Semestres
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>← Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">Escolha o semestre</p>
            <div className="semestres">
              {semestres.map((semestre, index) => (
                <button 
                  key={index} 
                  className="semestre-btn"
                  onClick={() => handleSemestreClick(semestre)}
                >
                  {semestre}
                </button>
              ))}
            </div>
          </div>
        ) : !videoSelected ? (
          // Tela de Vídeos
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>← Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">{semestreSelected}</p>
            
            {/* Barra de Progresso */}
            <div className="progresso-container">
              <div className="progresso-texto">
                <span>Progresso: {calcularProgresso()}%</span>
              </div>
              <div className="progresso-barra">
                <div 
                  className="progresso-preenchido" 
                  style={{ width: `${calcularProgresso()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="lista-videos">
              {todosVideos[disciplinaSelected][semestreSelected].map((video) => {
                const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
                const foiAssistido = videosAssistidos[chaveVideo] === true;
                return (
                  <button 
                    key={video.id} 
                    className={`video-btn ${foiAssistido ? 'assistido' : ''}`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <span className="video-numero">{foiAssistido ? '✓' : '▶'}</span>
                    {video.titulo}
                  </button>
                );
              })}
            </div>

            {/* Botão de Prova */}
            <div className="botao-prova-container">
              <button 
                className={`btn-prova ${verificarTodasAulasAssistidas() ? 'habilitado' : 'desabilitado'}`}
                onClick={handleFazerProva}
                disabled={!verificarTodasAulasAssistidas()}
              >
                {verificarTodasAulasAssistidas() ? '📝 Fazer Prova' : `📝 Fazer Prova (${calcularProgresso()}% concluído)`}
              </button>
            </div>
          </div>
        ) : (
          // Tela do Vídeo
          <div className="video-section">
            <button className="btn-voltar" onClick={handleVoltar}>← Voltar</button>
            <h2>{videoSelected.titulo}</h2>
            <p className="breadcrumb">{disciplinaSelected} / {semestreSelected}</p>
            <div className="video-container">
              <iframe
                width="100%"
                height="450"
                src={`https://www.youtube.com/embed/${videoSelected.youtubeId}?rel=0&modestbranding=1`}
                title={videoSelected.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-youtube"
              ></iframe>
            </div>
            <div className="proximos-videos">
              <h3>Próximos Vídeos</h3>
              <div className="lista-proximos">
                {todosVideos[disciplinaSelected][semestreSelected]
                  .filter(v => v.id !== videoSelected.id)
                  .slice(0, 3)
                  .map((video) => (
                    <button 
                      key={video.id}
                      className="proximo-btn"
                      onClick={() => handleVideoClick(video)}
                    >
                      {video.titulo}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ApresentacaoAula;