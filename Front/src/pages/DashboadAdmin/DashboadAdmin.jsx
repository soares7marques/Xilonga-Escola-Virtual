import React, { useState, useEffect } from 'react';
import './DashboadAdmin.css';
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaBookOpen, FaSignOutAlt } from 'react-icons/fa';
import { API_BASE_URL, apiFetch, clearAuthSession, changePassword } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const DashboadAdmin = ({ onSair }) => {
const navigate = useNavigate();
const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
const [quantidadeProfessores, setQuantidadeProfessores] = useState(0);
const [nomeProfessor, setNomeProfessor] = useState("");
const [emailProfessor, setEmailProfessor] = useState("");
const [senhaProfessor, setSenhaProfessor] = useState("");
const [telefoneProfessor, setTelefoneProfessor] = useState("");
const [generoProfessor, setGeneroProfessor] = useState("");
const [professorErros, setProfessorErros] = useState({});

// alterar senha
const [changeEmail, setChangeEmail] = useState("");
const [changeSenha, setChangeSenha] = useState("");
const [changeErrors, setChangeErrors] = useState({});

const [activeForm, setActiveForm] = useState(null);
const [mostrarConfirmacaoSaida, setMostrarConfirmacaoSaida] = useState(false);
const [saindo, setSaindo] = useState(false);
const [classeNome, setClasseNome] = useState("");
const [classeDescricao, setClasseDescricao] = useState("");
const [classeSelecionada, setClasseSelecionada] = useState("");
const [trimestreNome, setTrimestreNome] = useState("");
  
const [feedback, setFeedback] = useState({
  tipo: "",
  mensagem: ""
});
  // Estado para  material
const [materialClasse, setMaterialClasse] = useState("");
const [materialDisciplina, setMaterialDisciplina] = useState("");


const [classes, setClasses] = useState([]);
const [disciplinas, setDisciplinas] = useState([]);
const [trimestres, setTrimestres] = useState([]);
const [professores, setProfessores] = useState([]);

const disciplinasDisponiveis = disciplinas.filter((disciplina) => {
  const classeDaDisciplina = disciplina.classe?.nome;
  return !materialClasse || !classeDaDisciplina || classeDaDisciplina === materialClasse;
});

const limparErroProfessor = (campo) => {
  setProfessorErros((erros) => {
    const novosErros = { ...erros };
    delete novosErros[campo];
    return novosErros;
  });
};

const limparErroChange = (campo) => {
  setChangeErrors((erros) => {
    const novos = { ...erros };
    delete novos[campo];
    return novos;
  });
};

const validarAlterarSenha = () => {
  const erros = {};
  const email = changeEmail.trim();
  const senha = changeSenha;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    erros.email = "Informe o email.";
  } else if (!emailRegex.test(email)) {
    erros.email = "Informe um email válido.";
  }

  if (!senha) {
    erros.senha = "Informe a nova senha.";
  } else if (senha.length < 6) {
    erros.senha = "A senha deve ter no mínimo 6 caracteres.";
  }

  setChangeErrors(erros);
  return Object.keys(erros).length === 0;
};

const validarProfessor = () => {
  const erros = {};
  const nome = nomeProfessor.trim();
  const email = emailProfessor.trim();
  const telefone = telefoneProfessor.trim();
  const telefoneRegex = /^(\+244)?\s?9\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nome) {
    erros.nome = "Informe o nome do professor.";
  } else if (nome.length < 3) {
    erros.nome = "O nome deve ter pelo menos 3 caracteres.";
  }

  if (!email) {
    erros.email = "Informe o email.";
  } else if (!emailRegex.test(email)) {
    erros.email = "Informe um email válido.";
  }

  if (!senhaProfessor) {
    erros.senha = "Informe a senha.";
  } else if (senhaProfessor.length < 6) {
    erros.senha = "A senha deve ter no mínimo 6 caracteres.";
  }

  if (!telefone) {
    erros.telefone = "Informe o telefone.";
  } else if (!telefoneRegex.test(telefone)) {
    erros.telefone = "Use um telefone válido, ex: 923456789 ou +244 923456789.";
  }

  if (!generoProfessor) {
    erros.genero = "Selecione o gênero.";
  }

  if (!materialClasse) {
    erros.classe = "Selecione a classe.";
  }

  if (!materialDisciplina) {
    erros.disciplina = "Selecione a disciplina.";
  }

  setProfessorErros(erros);
  return Object.keys(erros).length === 0;
};

const lerMensagemErro = async (response) => {
  const texto = await response.text();

  if (!texto) {
    return "Erro ao cadastrar professor.";
  }

  try {
    const data = JSON.parse(texto);
    if (Array.isArray(data)) {
      return data.map((erro) => erro.message).filter(Boolean).join(" ");
    }
    return data.message || texto;
  } catch {
    return texto;
  }
};

useEffect(() => {
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/aluno/quantidade`, {
          headers: {"Content-Type": "application/json"}
        });
        if (response.ok) {
          const data = await response.json();
          setQuantidadeAlunos(typeof data === 'number' ? data : Number(data));
        }
      } catch (e) {}
    };
    fetchQuantidadeAlunos();
  }, []);

useEffect(() => {
    const fetchQuantidadeProfessores = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/adminn/quantidadeProfessores`, {
          headers: {"Content-Type": "application/json"}
        });
        if (response.ok) {
          const data = await response.json();
          setQuantidadeProfessores(typeof data === 'number' ? data : Number(data));
        }
      } catch (e) {}
    };
    fetchQuantidadeProfessores();
  }, []);

  const handleCadastrarProfessor = async (e) => {
  e.preventDefault();

  if (!validarProfessor()) {
    setFeedback({
      tipo: "erro",
      mensagem: "Corrija os campos destacados antes de cadastrar."
    });
    return;
  }

  try {
    const response = await apiFetch(
      `${API_BASE_URL}/adminn/registerProfessor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeProfessor.trim(),
          email: emailProfessor.trim(),
          senha: senhaProfessor,
          telefone: telefoneProfessor.trim(),
          genero: generoProfessor,
          classe: materialClasse,
          disciplina: materialDisciplina
        })
      }
    );

    if (response.ok) {

      setNomeProfessor("");
      setEmailProfessor("");
      setSenhaProfessor("");
      setTelefoneProfessor("");
      setGeneroProfessor("");
      setMaterialClasse("");
      setMaterialDisciplina("");
      setProfessorErros({});
      setQuantidadeProfessores((total) => total + 1);

        // atualizar lista de professores visível
        carregarProfessores();

        setFeedback({
          tipo: "sucesso",
          mensagem: "Professor cadastrado com sucesso!"
        });

        setTimeout(() => {
          setActiveForm(null);
          setFeedback({ tipo: "", mensagem: "" });
        }, 4000);
      
    } else {
      const erro = await lerMensagemErro(response);
      setFeedback({
        tipo: "erro",
        mensagem: erro || "Erro ao cadastrar professor."
        });

      setTimeout(() => {
          setFeedback({ tipo: "", mensagem: "" });
        }, 4000);
    }
  } catch (error) {
    console.error(error);
    setFeedback({
      tipo: "erro",
      mensagem: "Erro de conexão."
    });

    setTimeout(() => {
      setFeedback({ tipo: "", mensagem: "" });
    }, 4000);
  }
};

const carregarProfessores = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/adminn/listaProfessores`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      setProfessores(Array.isArray(data) ? data : []);
    }
  } catch (err) {
    console.error('Erro ao carregar professores', err);
  }
}

useEffect(() => {
  carregarProfessores();
}, []);

const carregarClasses = async () => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/adminn/listaClasse`,
        {
          headers: {'Content-Type': 'application/json'}
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      console.log("Classes recebidas:", data);

      setClasses(data);

    } catch (error) {
      console.error("Erro ao carregar classes:", error);
    }
  }
  useEffect(() => {
  carregarClasses();
}, []);

const carregarDisciplinas = async () => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/adminn/listaDisciplina`,
        {
          headers: {'Content-Type': 'application/json'}
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setDisciplinas(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    }
  }
  useEffect(() => {
  carregarDisciplinas();
}, []);

const carregarTrimestres = async () => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/adminn/listaTrimestre`,
        {
          headers: {'Content-Type': 'application/json'}
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setTrimestres(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Erro ao carregar trimestres:", error);
    }
  }
  useEffect(() => {
  carregarTrimestres();
}, []);

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

const handleAlterarSenha = async (e) => {
  e.preventDefault();

  if (!validarAlterarSenha()) {
    setFeedback({ tipo: 'erro', mensagem: 'Corrija os campos antes de enviar.' });
    return;
  }

  try {
    const response = await changePassword(changeEmail.trim(), changeSenha);

    if (response.ok) {
      setChangeEmail("");
      setChangeSenha("");
      setChangeErrors({});
      setFeedback({ tipo: 'sucesso', mensagem: 'Senha alterada com sucesso.' });
    } else {
      const text = await response.text();
      let mensagem = text || 'Erro ao alterar a senha.';
      try { mensagem = JSON.parse(text).message || mensagem; } catch {}
      setFeedback({ tipo: 'erro', mensagem });
    }
  } catch (err) {
    console.error(err);
    setFeedback({ tipo: 'erro', mensagem: 'Erro de conexão.' });
  }

  setTimeout(() => setFeedback({ tipo: '', mensagem: '' }), 4000);
};


const handleCadastrarDisciplina = async (e) => {
  e.preventDefault();

  if (!classeSelecionada || !materialDisciplina) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await apiFetch(
      `${API_BASE_URL}/adminn/registerDisciplina`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: materialDisciplina,
          classe: classeSelecionada,
        }),
      }
    );

   // console.log("Disciplina criada:", disciplina);

    if (response.ok) {
      const disciplina = await response.text();

      setMaterialDisciplina("");
      setClasseSelecionada("");
      carregarDisciplinas();
     
      setFeedback({
        tipo: "sucesso",
        mensagem: "Disciplina cadastrada com sucesso!"
      });

      setTimeout(() => {
        setActiveForm(null);
        setFeedback({ tipo: "", mensagem: "" });
      }, 3000);

      console.log("Disciplina criada:", disciplina);
    } else {
      const erro = await response.text();
      setFeedback({
        tipo: "erro",
        mensagem: erro || "Erro ao cadastrar disciplina!"
      });

      setTimeout(() => {
        setFeedback({ tipo: "", mensagem: "" });
      }, 3000);
    }
  } catch (error) {
    console.error(error);

          setFeedback({
        tipo: "erro",
        mensagem: "Erro de conexão com o servidor."
      });

      setTimeout(() => {
        setFeedback({ tipo: "", mensagem: "" });
      }, 3000);
  }
};

const handleCadastrarTrimestre = async (e) => {
  e.preventDefault();

  if (!trimestreNome.trim()) {
    setFeedback({
      tipo: "erro",
      mensagem: "Informe o nome do trimestre."
    });
    return;
  }

  try {
    const response = await apiFetch(`${API_BASE_URL}/adminn/registerTrimestre`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: trimestreNome.trim()
      }),
    });

    if (response.ok) {
      setTrimestreNome("");
      carregarTrimestres();
      setFeedback({
        tipo: "sucesso",
        mensagem: "Trimestre cadastrado com sucesso!"
      });

      setTimeout(() => {
        setActiveForm(null);
        setFeedback({ tipo: "", mensagem: "" });
      }, 3000);
    } else {
      const erro = await response.text();
      setFeedback({
        tipo: "erro",
        mensagem: erro || "Erro ao cadastrar trimestre."
      });
    }
  } catch {
    setFeedback({
      tipo: "erro",
      mensagem: "Erro de conexão com o servidor."
    });
  }
};

  return (
    <div className="dashboard-container">
      {/* Exemplo de uso dos dados do usuário */}
      <div style={{position: 'absolute', top: 10, right: 20, fontSize: '1em', color: '#555'}}>
      </div>
      <aside className="dashboard-sidebar">
        <h2>Menu</h2>
        <button onClick={() => setActiveForm(activeForm === 'classe' ? null : 'classe')}><FaPlus style={{marginRight:8}}/>Criar Classe</button>
        <button onClick={() => setActiveForm(activeForm === 'trimestre' ? null : 'trimestre')}><FaPlus style={{marginRight:8}}/>Criar Trimestre</button>
        <button onClick={() => setActiveForm(activeForm === 'disciplina' ? null : 'disciplina')}><FaPlus style={{marginRight:8}}/>Cadastrar Disciplina</button>
        <button onClick={() => setActiveForm(activeForm === 'material' ? null : 'material')}><FaChalkboardTeacher style={{marginRight:8}}/>Cadastar Professor</button>
        <button onClick={() => setActiveForm(activeForm === 'listarProfessores' ? null : 'listarProfessores')}>Listar Professores</button>
        <button onClick={() => setActiveForm(activeForm === 'alterarSenha' ? null : 'alterarSenha')}>Alterar Senha</button>
        <button className="sair" onClick={handleSair}><FaSignOutAlt style={{marginRight:8}}/>Sair</button>
      </aside>
      <main className="dashboard-main">
        
        <h1>Dashboard do Administrador</h1>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaUserGraduate className="dashboard-icon" />
            <span className="dashboard-card-title">Alunos</span>
            <span className="dashboard-card-value">{quantidadeAlunos}</span>
          </div>
          <div className="dashboard-card">
            <FaChalkboardTeacher className="dashboard-icon" />
            <span className="dashboard-card-title">Classes</span>
            <span className="dashboard-card-value">{classes.length}</span>
          </div>
          <div className="dashboard-card">
            <FaChalkboardTeacher className="dashboard-icon" />
            <span className="dashboard-card-title">Professores</span>
            <span className="dashboard-card-value">{quantidadeProfessores}</span>
          </div>
          <div className="dashboard-card">
            <FaBookOpen className="dashboard-icon" />
            <span className="dashboard-card-title">Trimestres</span>
            <span className="dashboard-card-value">{trimestres.length}</span>
          </div>
        </div>

        {activeForm === "trimestre" && (
          <form className="dashboard-form" onSubmit={handleCadastrarTrimestre}>
            <h2>
              <FaPlus style={{ marginRight: 8 }} />
              Criar Trimestre
            </h2>

            {feedback.mensagem && (
              <div className={`feedback ${feedback.tipo}`}>
                {feedback.mensagem}
              </div>
            )}

            <input
              type="text"
              placeholder="Ex: 1º Trimestre"
              value={trimestreNome}
              onChange={(e) => setTrimestreNome(e.target.value)}
              required
            />

            <button type="submit">
              <FaPlus style={{ marginRight: 8 }} />
              Cadastrar Trimestre
            </button>

            <div className="lista-trimestres-admin">
              {trimestres.length === 0 ? (
                <span>Nenhum trimestre cadastrado.</span>
              ) : (
                trimestres.map((trimestre) => (
                  <span key={trimestre.id ?? trimestre.nome}>{trimestre.nome}</span>
                ))
              )}
            </div>
          </form>
        )}

                {/* Formulário SPA para Cadastrar Disciplina */}
        {activeForm === "disciplina" && (
          <form className="dashboard-form" onSubmit={handleCadastrarDisciplina}>
            <h2>
              <FaPlus style={{ marginRight: 8 }} />
              Cadastrar Disciplina
            </h2>

          {feedback.mensagem && (
              <div
                className={`feedback ${feedback.tipo}`}
              >
                {feedback.mensagem}
              </div>
          )}

            <select
              value={classeSelecionada}
              onChange={(e) => setClasseSelecionada(e.target.value)}
              required
            >
              <option value="">Selecione a Classe</option>
              {classes.map((classe, idx) => (
                <option key={idx} value={classe.nome}>
                  {classe.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nome da disciplina"
              value={materialDisciplina}
              onChange={(e) => setMaterialDisciplina(e.target.value)}
              required
            />

            <button type="submit">
              <FaPlus style={{ marginRight: 8 }} />
              Cadastrar Disciplina
            </button>
          </form>
        )}

        {/* Formulário SPA para Criar Classe */}
        {activeForm === 'classe' && (
          
          <form className="dashboard-form" onSubmit={async (e) => {
            e.preventDefault();
            // Chamada ao endpoint para criar classe
            try {

              const response = await apiFetch(`${API_BASE_URL}/adminn/registerClasse`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome: classeNome, descricao: classeDescricao })
              });
              if (response.ok) {
                setClasses([...classes, { nome: classeNome, descricao: classeDescricao }]);
                setClasseNome("");
                setClasseDescricao("");
                carregarClasses();

                setFeedback({
                  tipo: "sucesso",
                  mensagem: "Classe criada com sucesso!"
                });

              setTimeout(() => {
                setActiveForm(null);
                setFeedback({ tipo: "", mensagem: "" });
              }, 4000);

              } else {
                setFeedback({
                tipo: "erro",
                mensagem: "Não foi possível criar a classe."
              });

              setTimeout(() => {
                setFeedback({ tipo: "", mensagem: "" });
              }, 3000);
              }
            } catch (err) {

              setFeedback({
              tipo: "erro",
              mensagem: "Erro de conexão com o servidor."
            });
            }

            setTimeout(() => {
            setFeedback({ tipo: "", mensagem: "" });
          }, 3000);

          }}>

            <h2><FaPlus style={{marginRight:8}}/>Criar Nova Classe</h2>

            {feedback.mensagem && (
              <div
                className={`feedback ${feedback.tipo}`}
              >
                {feedback.mensagem}
              </div>
        )}
            <input
              type="text"
              placeholder="Nome da Classe"
              value={classeNome}
              onChange={e => setClasseNome(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Descrição"
              value={classeDescricao}
              onChange={e => setClasseDescricao(e.target.value)}
              required
            />
            <button type="submit"><FaPlus style={{marginRight:8}}/>Criar</button>
          </form>
        )}


        {activeForm === 'material' && (
          <form className="dashboard-form" onSubmit={handleCadastrarProfessor} noValidate>
            <h2><FaBookOpen style={{marginRight:8}}/>Cadastrar Professor</h2>
            
          {feedback.mensagem && (
              <div
                className={`feedback ${feedback.tipo}`}
              >
                {feedback.mensagem}
              </div>
          )}

            <label htmlFor="nome-input">Nome</label>
            <input
              id="nome-input"
              type="text"
              placeholder="Ex: Soares José"
              value={nomeProfessor}
              onChange={(e) => {
                setNomeProfessor(e.target.value);
                limparErroProfessor("nome");
              }}
              aria-invalid={Boolean(professorErros.nome)}
              required
            />
            {professorErros.nome && <span className="campo-erro">{professorErros.nome}</span>}

            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="Ex: soares@gmail.com"
              value={emailProfessor}
              onChange={(e) => {
                setEmailProfessor(e.target.value);
                limparErroProfessor("email");
              }}
              aria-invalid={Boolean(professorErros.email)}
              required
            />
            {professorErros.email && <span className="campo-erro">{professorErros.email}</span>}

            <label htmlFor="senha-input">Senha</label>
            <input
              id="senha-input"
              type="password"
              placeholder="Ex:******"
              value={senhaProfessor}
              onChange={(e) => {
                setSenhaProfessor(e.target.value);
                limparErroProfessor("senha");
              }}
              aria-invalid={Boolean(professorErros.senha)}
              required
            />
            {professorErros.senha && <span className="campo-erro">{professorErros.senha}</span>}

            <label htmlFor="telefone-input">Telefone</label>
            <input
              id="telefone-input"
              type="tel"
              placeholder="Ex: 923456789"
              value={telefoneProfessor}
              onChange={(e) => {
                setTelefoneProfessor(e.target.value);
                limparErroProfessor("telefone");
              }}
              aria-invalid={Boolean(professorErros.telefone)}
              required
            />
            {professorErros.telefone && <span className="campo-erro">{professorErros.telefone}</span>}

            <label htmlFor="genero-select">Gênero:</label>
            <select
              id="genero-select"
              value={generoProfessor}
              onChange={(e) => {
                setGeneroProfessor(e.target.value);
                limparErroProfessor("genero");
              }}
              aria-invalid={Boolean(professorErros.genero)}
              required
            >
              <option value="">Selecione o Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {professorErros.genero && <span className="campo-erro">{professorErros.genero}</span>}
            
            <label htmlFor="classe-select">Classe:</label>
            <select 
              id="classe-select"
              value={materialClasse} 
              onChange={e => {
                setMaterialClasse(e.target.value);
                setMaterialDisciplina("");
                limparErroProfessor("classe");
                limparErroProfessor("disciplina");
              }} 
              aria-invalid={Boolean(professorErros.classe)}
              required
            >

            <option value="">Selecione a Classe</option>
              {classes.map((classe, idx) => (
                <option key={idx} value={classe.nome}>{classe.nome}</option>
              ))}
            </select>
            {professorErros.classe && <span className="campo-erro">{professorErros.classe}</span>}

            <label htmlFor="disciplina-select">Disciplina:</label>
            <select 
              id="disciplina-select"
              value={materialDisciplina} 
              onChange={e => {
                setMaterialDisciplina(e.target.value);
                limparErroProfessor("disciplina");
              }} 
              aria-invalid={Boolean(professorErros.disciplina)}
              required
            >
              <option value="">Selecione a Disciplina</option>
              {disciplinasDisponiveis.map((disciplina, idx) => (
                <option key={disciplina.id ?? idx} value={disciplina.nome ?? disciplina}>
                  {disciplina.nome ?? disciplina}
                </option>
              ))}
            </select>
            {professorErros.disciplina && <span className="campo-erro">{professorErros.disciplina}</span>}

            <button type="submit">
              <FaBookOpen style={{marginRight:8}} />
              Cadastrar Professor
            </button>
          </form>
        )}

        {activeForm === 'alterarSenha' && (
          <form className="dashboard-form" onSubmit={handleAlterarSenha} noValidate>
            <h2>Alterar Senha</h2>

            {feedback.mensagem && (
              <div className={`feedback ${feedback.tipo}`}>
                {feedback.mensagem}
              </div>
            )}

            <label htmlFor="change-email">Email</label>
            <input
              id="change-email"
              type="email"
              placeholder="Email do usuário"
              value={changeEmail}
              onChange={(e) => { setChangeEmail(e.target.value); limparErroChange('email'); }}
              aria-invalid={Boolean(changeErrors.email)}
              required
            />
            {changeErrors.email && <span className="campo-erro">{changeErrors.email}</span>}

            <label htmlFor="change-senha">Nova Senha</label>
            <input
              id="change-senha"
              type="password"
              placeholder="Nova senha"
              value={changeSenha}
              onChange={(e) => { setChangeSenha(e.target.value); limparErroChange('senha'); }}
              aria-invalid={Boolean(changeErrors.senha)}
              required
            />
            {changeErrors.senha && <span className="campo-erro">{changeErrors.senha}</span>}

            <div style={{display: 'flex', gap: '8px'}}>
              <button type="submit">Alterar Senha</button>
            </div>
          </form>
        )}

        {activeForm === 'listarProfessores' && (
          <div className="dashboard-form">
            <h2>Professores Cadastrados</h2>
            {professores.length === 0 ? (
              <span>Nenhum professor cadastrado.</span>
            ) : (
              <table className="professores-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Classe</th>
                    <th>Disciplina</th>
                  </tr>
                </thead>
                <tbody>
                  {professores.map((p, idx) => (
                    <tr key={p.id ?? idx}>
                      <td>{p.nome}</td>
                      <td>{p.email}</td>
                      <td>{p.classe}</td>
                      <td>{p.disciplina}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {mostrarConfirmacaoSaida && (
        <div className="dashboard-logout-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-logout-title">
          <div className="dashboard-logout-modal">
            <span className="dashboard-logout-icon" aria-hidden="true">
              <FaSignOutAlt />
            </span>
            <h2 id="admin-logout-title">Terminar sessão?</h2>
            <p>Ao sair do painel administrativo, será necessário fazer login novamente para gerir o sistema.</p>

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

export default DashboadAdmin;
