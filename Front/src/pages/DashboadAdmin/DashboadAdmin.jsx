import React, { useState, useEffect } from 'react';
import './DashboadAdmin.css';
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaBookOpen, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';


const DashboadAdmin = ({ onCriarClasse,onSair }) => {
const [quantidadeAlunos, setQuantidadeAlunos] = useState(0);
const quantidadeClasses = 2; // valor fixo
const [nomeProfessor, setNomeProfessor] = useState("");
const [emailProfessor, setEmailProfessor] = useState("");
const [senhaProfessor, setSenhaProfessor] = useState("");

const [activeForm, setActiveForm] = useState(null);
const [classeNome, setClasseNome] = useState("");
const [classeDescricao, setClasseDescricao] = useState("");
const [semestres, setSemestres] = useState([]); // lista de semestres cadastrados
const [classeSelecionada, setClasseSelecionada] = useState("");
const [semestreNome, setSemestreNome] = useState("");
  
const [feedback, setFeedback] = useState({
  tipo: "",
  mensagem: ""
});
  // Estado para  material
const [materialClasse, setMaterialClasse] = useState("");
const [materialDisciplina, setDisciplinaNome] = useState("");


  
  // Simulação de lista de classes cadastradas
const [classes, setClasses] = useState([]);
  
  // Listas de disciplinas e semestres
const disciplinasDisponiveis = [
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

useEffect(() => {
    const fetchQuantidadeAlunos = async () => {
      try {
        const response = await fetch('http://localhost:8080/aluno/quantidade', {
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

  const handleCadastrarProfessor = async (e) => {
  e.preventDefault();

  if (
    !nomeProfessor ||
    !emailProfessor ||
    !telefoneProfessor ||
    !materialClasse ||
    !materialDisciplina
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/adminn/registerProfessor",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeProfessor,
          email: emailProfessor,
          senha: senhaProfessor,
          classe: materialClasse,
          disciplina: materialDisciplina
        })
      }
    );

    if (response.ok) {

      setNomeProfessor("");
      setEmailProfessor("");
      setTelefoneProfessor("");
      setMaterialClasse("");
      setMaterialDisciplina("");

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
        tipo: "sucesso",
        mensagem: "Erro ao cadastrar professor.!"
        });

      setTimeout(() => {
          setFeedback({ tipo: "", mensagem: "" });
        }, 4000);
    }
  } catch (error) {
    console.error(error);
    setFeedback({
    tipo: "sucesso",
      mensagem: "Erro de conexão.!"
    });

    setTimeout(() => {
      setFeedback({ tipo: "", mensagem: "" });
    }, 4000);
  }
};

const carregarClasses = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/adminn/listaClasse",
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


const handleCadastrarDisciplina = async (e) => {
  e.preventDefault();

  if (!classeSelecionada || !materialDisciplina) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:8080/adminn/registerDisciplina",
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

    if (response.ok) {
      const disciplina = await response.json();

      setDisciplinaNome("");
      setClasseSelecionada("");
     
      setFeedback({
        tipo: "sucesso",
        mensagem: "Classe criada com sucesso!"
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
        mensagem: "Erro a cadastrar disciplina!"
      });

      setTimeout(() => {
        setFeedback({ tipo: "", mensagem: "" });
      }, 3000);
    }
  } catch (error) {
    console.error(error);

          setFeedback({
        tipo: "Erro",
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
            <span className="dashboard-card-value">{quantidadeClasses}</span>
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

              const response = await fetch('http://localhost:8080/adminn/registerClasse', {
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

            <label htmlFor="titulo-input">Nome</label>
            <input
              id="nome-input"
              type="text"
              placeholder="Ex: Soares José"
              value={nomeProfessor}
              onChange={(e) => setNomeProfessor(e.target.value)}
              required
            />

            <label htmlFor="titulo-input">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="Ex: soares@gmail.com"
              value={emailProfessor}
              onChange={(e) => setEmailProfessor(e.target.value)}
              required
            />

            <label htmlFor="titulo-input">Senha</label>
            <input
              id="senha-input"
              type="text"
              placeholder="Ex:******"
              value={senhaProfessor}
              onChange={(e) => setSenhaProfessor(e.target.value)}
              required
            />
            
            <label htmlFor="classe-select">Classe:</label>
            <select 
              id="classe-select"
              value={materialClasse} 
              onChange={e => setMaterialClasse(e.target.value)} 
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
                <option key={idx} value={disciplina}>{disciplina}</option>
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
