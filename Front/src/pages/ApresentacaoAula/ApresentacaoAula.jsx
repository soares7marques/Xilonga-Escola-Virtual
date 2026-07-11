import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/NavBarAula/NavbarAula";
import Footer from "../../components/Footer/Footer";
import "./ApresentacaoAula.css";
import { API_BASE_URL, apiFetch, getCurrentUser } from "../../services/api";

const getTrimestreMaterial = (material) => material.trimestre || material.semestre || "";

const agruparTrimestres = (materiais) => {
  return [...new Set(materiais.map(getTrimestreMaterial).filter(Boolean))];
};

const normalizarTexto = (valor) =>
  (valor || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const criarVideoUrl = (material) => {
  if (material.nomeArquivoSalvo) {
    return `${API_BASE_URL}/media/aulas/${encodeURIComponent(material.nomeArquivoSalvo)}`;
  }

  return `${API_BASE_URL}/professor/materiais/${material.id}/video`;
};

const criarVideoUrlPorId = (materialId) => `${API_BASE_URL}/professor/materiais/${materialId}/video`;

const ApresentacaoAula = () => {
  const usuario = getCurrentUser();
  const [classeAluno, setClasseAluno] = useState("");
  const [disciplinaSelected, setDisciplinaSelected] = useState(null);
  const [trimestreSelected, setTrimestreSelected] = useState(null);
  const [videoSelected, setVideoSelected] = useState(null);
  const [disciplinas, setDisciplinas] = useState([]);
  const [materiaisBackend, setMateriaisBackend] = useState([]);
  const [carregandoConteudo, setCarregandoConteudo] = useState(false);
  const [mensagemConteudo, setMensagemConteudo] = useState("");
  const [videoObjectUrl, setVideoObjectUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoTentouFallback, setVideoTentouFallback] = useState(false);
  const [videosAssistidosIds, setVideosAssistidosIds] = useState([]);

  const trimestres = useMemo(() => agruparTrimestres(materiaisBackend), [materiaisBackend]);

  const classeAlunoNormalizada = useMemo(() => normalizarTexto(classeAluno), [classeAluno]);

  const aulasDoTrimestre = useMemo(() => {
    if (!trimestreSelected) {
      return [];
    }

    return materiaisBackend
      .filter((material) => normalizarTexto(getTrimestreMaterial(material)) === normalizarTexto(trimestreSelected))
      .map((material) => ({
        id: `material-${material.id}`,
        materialId: material.id,
        titulo: material.titulo,
        nomeArquivo: material.nomeArquivo,
        videoUrl: criarVideoUrl(material),
        professorEmail: material.professorEmail
      }));
  }, [materiaisBackend, trimestreSelected]);

  const videosAssistidosSet = useMemo(
    () => new Set(videosAssistidosIds.map((id) => Number(id))),
    [videosAssistidosIds]
  );

  useEffect(() => {
    const carregarPerfilEProgresso = async () => {
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

        const progressoResponse = await apiFetch(`${API_BASE_URL}/aluno/progresso?email=${encodeURIComponent(usuario.email)}`);
        if (!progressoResponse.ok) {
          throw new Error("Não foi possível carregar o progresso do aluno.");
        }

        const progressoData = await progressoResponse.json();
        setVideosAssistidosIds(Array.isArray(progressoData.videosAssistidosIds) ? progressoData.videosAssistidosIds : []);
      } catch (error) {
        setMensagemConteudo(error.message || "Não foi possível carregar os dados do backend.");
        setDisciplinas([]);
        setVideosAssistidosIds([]);
      } finally {
        setCarregandoConteudo(false);
      }
    };

    carregarPerfilEProgresso();
  }, [usuario.email]);

  useEffect(() => {
    const carregarDisciplinas = async () => {
      if (!classeAluno) {
        setDisciplinas([]);
        return;
      }

      try {
        const disciplinasResponse = await apiFetch(`${API_BASE_URL}/adminn/listaDisciplina`);
        if (!disciplinasResponse.ok) {
          throw new Error("Não foi possível carregar disciplinas.");
        }

        const data = await disciplinasResponse.json();
        const lista = Array.isArray(data) ? data : [];
        const disciplinasDaClasse = lista
          .filter((disciplina) => !classeAluno || disciplina.classe?.nome === classeAluno)
          .map((disciplina) => disciplina.nome)
          .filter(Boolean);

        setDisciplinas([...new Set(disciplinasDaClasse)]);
      } catch {
        setDisciplinas([]);
      }
    };

    carregarDisciplinas();
  }, [classeAluno]);

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
        setMateriaisBackend(
          lista.filter((material) => {
            if (!classeAlunoNormalizada) {
              return true;
            }

            return normalizarTexto(material.classe) === classeAlunoNormalizada;
          })
        );
      } catch (error) {
        setMateriaisBackend([]);
        setMensagemConteudo(error.message || "Não foi possível carregar as aulas.");
      } finally {
        setCarregandoConteudo(false);
      }
    };

    carregarConteudo();
  }, [disciplinaSelected, classeAlunoNormalizada]);

  useEffect(() => {
    if (!videoSelected?.materialId) {
      setVideoObjectUrl("");
      setVideoLoading(false);
      setVideoError("");
      setVideoTentouFallback(false);
      return;
    }

    setVideoLoading(true);
    setVideoError("");
    setVideoTentouFallback(false);
    setVideoObjectUrl(videoSelected.videoUrl || criarVideoUrlPorId(videoSelected.materialId));
  }, [videoSelected]);

  const handleDisciplinaClick = (disciplina) => {
    setDisciplinaSelected(disciplina);
    setTrimestreSelected(null);
    setVideoSelected(null);
  };

  const handleTrimestreClick = (trimestre) => {
    setTrimestreSelected(trimestre);
    setVideoSelected(null);
  };

  const handleVideoClick = async (video) => {
    setVideoSelected(video);

    try {
      const response = await apiFetch(`${API_BASE_URL}/aluno/progresso`, {
        method: "POST",
        body: JSON.stringify({
          email: usuario.email,
          materialId: video.materialId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideosAssistidosIds(Array.isArray(data.videosAssistidosIds) ? data.videosAssistidosIds : []);
      }
    } catch {
      // Mantém o estado atual mesmo se o backend falhar momentaneamente.
    }
  };

  const calcularProgresso = () => {
    if (aulasDoTrimestre.length === 0) {
      return 0;
    }

    const assistidas = aulasDoTrimestre.filter((video) => videosAssistidosSet.has(Number(video.materialId))).length;
    return Math.round((assistidas / aulasDoTrimestre.length) * 100);
  };

  const handleVoltar = () => {
    if (videoSelected) {
      setVideoSelected(null);
    } else if (trimestreSelected) {
      setTrimestreSelected(null);
    } else {
      setDisciplinaSelected(null);
    }
  };

  const handleVideoError = () => {
    const fallbackUrl = videoSelected?.materialId ? criarVideoUrlPorId(videoSelected.materialId) : "";

    if (fallbackUrl && videoObjectUrl !== fallbackUrl && !videoTentouFallback) {
      setVideoTentouFallback(true);
      setVideoObjectUrl(fallbackUrl);
      return;
    }

    setVideoLoading(false);
    setVideoError("Não foi possível carregar o vídeo.");
    setVideoObjectUrl("");
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
        ) : !trimestreSelected ? (
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">Escolha o trimestre</p>
            {carregandoConteudo && <p className="subtitulo">A carregar aulas...</p>}
            {!carregandoConteudo && trimestres.length === 0 && (
              <p className="estado-conteudo">Nenhuma aula disponível para esta disciplina.</p>
            )}
            <div className="trimestres">
              {trimestres.map((trimestre) => (
                <button
                  key={trimestre}
                  className="trimestre-btn"
                  onClick={() => handleTrimestreClick(trimestre)}
                >
                  {trimestre}
                </button>
              ))}
            </div>
          </div>
        ) : !videoSelected ? (
          <div className="area-estudo">
            <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            <h2>{disciplinaSelected}</h2>
            <p className="subtitulo">{trimestreSelected}</p>

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
              {aulasDoTrimestre.map((video) => {
                const foiAssistido = videosAssistidosSet.has(Number(video.materialId));
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
            <p className="breadcrumb">{disciplinaSelected} / {trimestreSelected}</p>
            <div className="video-container">
              <div className="material-disponivel">
                {videoLoading && <p className="estado-conteudo">A carregar vídeo...</p>}
                {videoError && <p className="estado-conteudo">{videoError}</p>}
                {videoObjectUrl ? (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    src={videoObjectUrl}
                    width="100%"
                    height="360"
                    onLoadedData={() => setVideoLoading(false)}
                    onError={handleVideoError}
                  >
                    O seu navegador não suporta vídeo HTML5.
                  </video>
                ) : (
                  !videoLoading && !videoError && (
                  <>
                    <h3>Material disponibilizado pelo professor</h3>
                    <p>{videoSelected.nomeArquivo || "Arquivo cadastrado no backend."}</p>
                    <span>{videoSelected.professorEmail}</span>
                  </>
                  )
                )}
              </div>
            </div>
            <div className="proximos-videos">
              <h3>Próximos Vídeos</h3>
              <div className="lista-proximos">
                {aulasDoTrimestre
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
