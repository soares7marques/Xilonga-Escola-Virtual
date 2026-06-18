import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/NavBarAula/NavbarAula";
import Footer from "../../components/Footer/Footer";
import "./ApresentacaoAula.css";
import { API_BASE_URL, apiFetch, getCurrentUser } from "../../services/api";

const agruparSemestres = (materiais) => {
  return [...new Set(materiais.map((material) => material.semestre).filter(Boolean))];
};

const ApresentacaoAula = () => {
  const usuario = getCurrentUser();
  const [classeAluno, setClasseAluno] = useState("");
  const [disciplinaSelected, setDisciplinaSelected] = useState(null);
  const [semestreSelected, setSemestreSelected] = useState(null);
  const [videoSelected, setVideoSelected] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [materiaisBackend, setMateriaisBackend] = useState([]);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [mensagemConteudo, setMensagemConteudo] = useState("");
  const [videoObjectUrl, setVideoObjectUrl] = useState("");
  const [videosAssistidos, setVideosAssistidos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("videosAssistidos") || "{}");
    } catch {
      return {};
    }
  });

  const semestres = useMemo(() => agruparSemestres(materiaisBackend), [materiaisBackend]);

  const aulasDoSemestre = useMemo(() => {
    if (!semestreSelected) {
      return [];
    }

    return materiaisBackend
      .filter((material) => material.semestre === semestreSelected)
      .map((material) => ({
        id: `material-${material.id}`,
        materialId: material.id,
        titulo: material.titulo,
        nomeArquivo: material.nomeArquivo,
        professorEmail: material.professorEmail
      }));
  }, [materiaisBackend, semestreSelected]);

  useEffect(() => {
    const carregarPerfilEDisciplinas = async () => {
      setCarregandoConteudo(true);
      setMensagemConteudo("");

      try {
        const perfilResponse = await apiFetch(`${API_BASE_URL}/aluno/perfil?email=${encodeURIComponent(usuario.email)}`);
        if (!perfilResponse.ok) {
          throw new Error("Não foi possível carregar o perfil do aluno.");
        }

        const perfil = await perfilResponse.json();
        const classe = perfil.classe || "";
        setClasseAluno(classe);

        const disciplinasResponse = await apiFetch(`${API_BASE_URL}/adminn/listaDisciplina`);
        if (!disciplinasResponse.ok) {
          throw new Error("Não foi possível carregar disciplinas.");
        }

        const data = await disciplinasResponse.json();
        const lista = Array.isArray(data) ? data : [];
        const disciplinasDaClasse = lista
          .filter((disciplina) => !classe || disciplina.classe?.nome === classe)
          .map((disciplina) => disciplina.nome)
          .filter(Boolean);

        setDisciplinas([...new Set(disciplinasDaClasse)]);
      } catch (error) {
        setMensagemConteudo(error.message || "Não foi possível carregar os dados do backend.");
        setDisciplinas([]);
      } finally {
        setCarregandoConteudo(false);
      }
    };

    carregarPerfilEDisciplinas();
  }, [usuario.email]);

  useEffect(() => {
    if (!disciplinaSelected) {
      setMateriaisBackend([]);
      return;
    }

    const carregarConteudo = async () => {
      setCarregandoConteudo(true);
      setMensagemConteudo("");
      const params = new URLSearchParams({ disciplina: disciplinaSelected });

      try {
        const response = await apiFetch(`${API_BASE_URL}/professor/materiais?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Não foi possível carregar as aulas.");
        }

        const materiais = await response.json();
        const lista = Array.isArray(materiais) ? materiais : [];
        setMateriaisBackend(lista.filter((material) => !classeAluno || material.classe === classeAluno));
      } catch (error) {
        setMateriaisBackend([]);
        setMensagemConteudo(error.message || "Não foi possível carregar as aulas.");
      } finally {
        setCarregandoConteudo(false);
      }
    };

    carregarConteudo();
  }, [disciplinaSelected, classeAluno]);

  useEffect(() => {
    if (!videoSelected?.materialId) {
      setVideoObjectUrl("");
      return;
    }

    let objectUrl = "";

    const carregarVideo = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/professor/materiais/${videoSelected.materialId}/video`);

        if (!response.ok) {
          throw new Error("Não foi possível carregar o vídeo.");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setVideoObjectUrl(objectUrl);
      } catch {
        setVideoObjectUrl("");
      }
    };

    carregarVideo();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [videoSelected]);

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
    const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;

    setVideosAssistidos(prev => {
      const novoProgresso = {
        ...prev,
        [chaveVideo]: true
      };

      try {
        localStorage.setItem("videosAssistidos", JSON.stringify(novoProgresso));
      } catch {
        // Mantém o progresso na sessão atual se o localStorage falhar.
      }

      return novoProgresso;
    });
  };

  const calcularProgresso = () => {
    if (aulasDoSemestre.length === 0) {
      return 0;
    }

    const assistidas = aulasDoSemestre.filter(video => {
      const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
      return videosAssistidos[chaveVideo] === true;
    }).length;
    return Math.round((assistidas / aulasDoSemestre.length) * 100);
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
          <div className="area-estudo">
            <h2>{classeAluno || "Aulas"} - Disciplinas</h2>
            {carregandoConteudo && <p className="subtitulo">A carregar dados...</p>}
            {mensagemConteudo && <p className="estado-conteudo">{mensagemConteudo}</p>}
            {!carregandoConteudo && disciplinas.length === 0 && !mensagemConteudo && (
              <p className="estado-conteudo">Nenhuma disciplina disponível para a sua classe.</p>
            )}
            <div className="disciplinas">
              {disciplinas.map((disciplina) => (
                <button
                  key={disciplina}
                  className="disciplina-btn"
                  onClick={() => handleDisciplinaClick(disciplina)}
                >
                  {disciplina}
                </button>
              ))}
            </div>
          </div>
        ) : !semestreSelected ? (
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">Escolha o semestre</p>
            {carregandoConteudo && <p className="subtitulo">A carregar aulas...</p>}
            {!carregandoConteudo && semestres.length === 0 && (
              <p className="estado-conteudo">Nenhuma aula disponível para esta disciplina.</p>
            )}
            <div className="semestres">
              {semestres.map((semestre) => (
                <button
                  key={semestre}
                  className="semestre-btn"
                  onClick={() => handleSemestreClick(semestre)}
                >
                  {semestre}
                </button>
              ))}
            </div>
          </div>
        ) : !videoSelected ? (
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">{semestreSelected}</p>

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
              {aulasDoSemestre.map((video) => {
                const chaveVideo = `${disciplinaSelected}-${semestreSelected}-${video.id}`;
                const foiAssistido = videosAssistidos[chaveVideo] === true;
                return (
                  <button
                    key={video.id}
                    className={`video-btn ${foiAssistido ? 'assistido' : ''}`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <span className="video-numero">{foiAssistido ? 'OK' : 'Ver'}</span>
                    {video.titulo}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="video-section">
            <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            <h2>{videoSelected.titulo}</h2>
            <p className="breadcrumb">{disciplinaSelected} / {semestreSelected}</p>
            <div className="video-container">
              <div className="material-disponivel">
                {videoObjectUrl ? (
                  <video controls src={videoObjectUrl} width="100%" height="360">
                    O seu navegador não suporta vídeo HTML5.
                  </video>
                ) : (
                  <>
                    <h3>Material disponibilizado pelo professor</h3>
                    <p>{videoSelected.nomeArquivo || "Arquivo cadastrado no backend."}</p>
                    <span>{videoSelected.professorEmail}</span>
                  </>
                )}
              </div>
            </div>
            <div className="proximos-videos">
              <h3>Próximos Vídeos</h3>
              <div className="lista-proximos">
                {aulasDoSemestre
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
