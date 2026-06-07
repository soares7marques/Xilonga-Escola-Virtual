import { Link, useNavigate } from "react-router-dom";
import "./NavbarAula.css";

const NavbarAula = () => {
  const navigate = useNavigate();

  const handleSair = async () => {
    if (window.confirm("Você realmente deseja sair do site?")) {
      // Chama o endpoint de logout para remover o cookie do token
      try {
        await fetch("http://localhost:8080/utilizador/logout", {
          method: "POST",
        headers: {
          'Content-Type': 'application/json',
        }, credentials: 'include',
        });
      } catch (e) {
        // Ignora erro de rede
      }
      sessionStorage.clear();
      navigate("/login");
      console.log("Usuário saiu do site.");
    }
  };

  return (
    <header className="header">
      <h1>Xilonga Escola Virtual Angolana</h1>
      <nav>

        <Link to="/aula">Aula</Link>
        <Link to="/perfil">Perfil</Link>
        
        {/* Botão Sair com Ícone */}
        <button className="btn-sair" onClick={handleSair} >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </nav>
    </header>
  );
};

export default NavbarAula;

    








