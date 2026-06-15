import { Link, useNavigate } from "react-router-dom";
import "./NavbarAula.css";
import { clearAuthSession } from "../../services/api";

const NavbarAula = () => {
  const navigate = useNavigate();

  const handleSair = async () => {
    if (window.confirm("Você realmente deseja sair do site?")) {
      clearAuthSession();
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

    








