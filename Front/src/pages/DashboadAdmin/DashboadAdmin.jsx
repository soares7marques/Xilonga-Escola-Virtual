import React, { useState, useEffect } from 'react';
import './DashboadAdmin.css';
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaBookOpen, FaSignOutAlt } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:8080";

const DashboadAdmin = ({ onSair }) => {
const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
const [quantidadeProfessores, setQuantidadeProfessores] = useState(0);
const [nomeProfessor, setNomeProfessor] = useState("");
const [emailProfessor, setEmailProfessor] = useState("");
const [senhaProfessor, setSenhaProfessor] = useState("");
const [telefoneProfessor, setTelefoneProfessor] = useState("");
const [generoProfessor, setGeneroProfessor] = useState("");

const [activeForm, setActiveForm] = useState(null);
const [classeNome, setClasseNome] = useState("");
const [classeDescricao, setClasseDescricao] = useState("");
const [classeSelecionada, setClasseSelecionada] = useState("");
  
const [feedback, setFeedback] = useState({
  tipo: "",
  mensagem: ""
});
  // Estado para  material
const [materialClasse, setMaterialClasse] = useState("");
const [materialDisciplina, setMaterialDisciplina] = useState("");


  
  // Simulação de lista de classes cadastradas
const [classes, setClasses] = useState([]);
const [disciplinas, setDisciplinas] = useState([]);

const disciplinasDisponiveis = disciplinas.filter((disciplina) => {
  const classeDaDisciplina = disciplina.classe?.nome;
  return !materialClasse || !classeDaDisciplina || classeDaDisciplina === materialClasse;
});

useEffect(() => {
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/aluno/quantidade`, {
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
        const response = await fetch(`${API_BASE_URL}/adminn/quantidadeProfessores`, {
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

  if (
    !nomeProfessor ||
    !emailProfessor ||
    !senhaProfessor ||
    !telefoneProfessor ||
    !generoProfessor ||
    !materialClasse ||
    !materialDisciplina
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/adminn/registerProfessor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeProfessor,
          email: emailProfessor,
          senha: senhaProfessor,
          telefone: telefoneProfessor,
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
      setQuantidadeProfessores((total) => total + 1);

        setFeedback({
          tipo: "sucesso",
          mensagem: "Professor cadastrado com sucesso!"
        });

        setTimeout(() => {
          setActiveForm(null);
          setFeedback({ tipo: "", mensagem: "" });
        }, 4000);
      
    } else {
      const erro = await response.text();
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

const carregarClasses = async () => {
    try {
      const response = await fetch(
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
      const response = await fetch(
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


const handleCadastrarDisciplina = async (e) => {
  e.preventDefault();

  if (!classeSelecionada || !materialDisciplina) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch(
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

  return (
    <div className="dashboard-container">
      {/* Exemplo de uso dos dados do usuário */}
      <div style={{position: 'absolute', top: 10, right: 20, fontSize: '1em', color: '#555'}}>
      </div>
      <aside className="dashboard-sidebar">
        <h2>Menu</h2>
        <button onClick={() => setActiveForm(activeForm === 'classe' ? null : 'classe')}><FaPlus style={{marginRight:8}}/>Criar Classe</button>
        <button onClick={() => setActiveForm(activeForm === 'disciplina' ? null : 'disciplina')}><FaPlus style={{marginRight:8}}/>Cadastrar Disciplina</button>
        <button onClick={() => setActiveForm(activeForm === 'material' ? null : 'material')}><FaChalkboardTeacher style={{marginRight:8}}/>Cadastar Professor</button>
        <button className="sair" onClick={onSair}><FaSignOutAlt style={{marginRight:8}}/>Sair</button>
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
        </div>

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

              const response = await fetch(`${API_BASE_URL}/adminn/registerClasse`, {
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
          <form className="dashboard-form" onSubmit={handleCadastrarProfessor}>
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
              onChange={(e) => setNomeProfessor(e.target.value)}
              required
            />

            <label htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="Ex: soares@gmail.com"
              value={emailProfessor}
              onChange={(e) => setEmailProfessor(e.target.value)}
              required
            />

            <label htmlFor="senha-input">Senha</label>
            <input
              id="senha-input"
              type="password"
              placeholder="Ex:******"
              value={senhaProfessor}
              onChange={(e) => setSenhaProfessor(e.target.value)}
              required
            />

            <label htmlFor="telefone-input">Telefone</label>
            <input
              id="telefone-input"
              type="tel"
              placeholder="Ex: 923456789"
              value={telefoneProfessor}
              onChange={(e) => setTelefoneProfessor(e.target.value)}
              required
            />

            <label htmlFor="genero-select">Gênero:</label>
            <select
              id="genero-select"
              value={generoProfessor}
              onChange={(e) => setGeneroProfessor(e.target.value)}
              required
            >
              <option value="">Selecione o Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            
            <label htmlFor="classe-select">Classe:</label>
            <select 
              id="classe-select"
              value={materialClasse} 
              onChange={e => {
                setMaterialClasse(e.target.value);
                setMaterialDisciplina("");
              }} 
              required
            >

            <option value="">Selecione a Classe</option>
              {classes.map((classe, idx) => (
                <option key={idx} value={classe.nome}>{classe.nome}</option>
              ))}
            </select>

            <label htmlFor="disciplina-select">Disciplina:</label>
            <select 
              id="disciplina-select"
              value={materialDisciplina} 
              onChange={e => setMaterialDisciplina(e.target.value)} 
              required
            >
              <option value="">Selecione a Disciplina</option>
              {disciplinasDisponiveis.map((disciplina, idx) => (
                <option key={disciplina.id ?? idx} value={disciplina.nome ?? disciplina}>
                  {disciplina.nome ?? disciplina}
                </option>
              ))}
            </select>

            <button type="submit">
              <FaBookOpen style={{marginRight:8}} />
              Cadastrar Professor
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default DashboadAdmin;
