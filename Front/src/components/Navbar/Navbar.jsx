
import { Link } from "react-router-dom";
import "./Navbar.css";
    
const Navbar = () => {
  return (
        <header className="header">
        <h1>Xilonga Escola Virtual Angolana</h1>
        <nav>
          <Link to="/inicio">Inicio</Link>
          <Link to="/login">Aula</Link>
          <Link to="/perfil">Perfil</Link>
        </nav>
      </header>
  );
};

export default Navbar;
    








