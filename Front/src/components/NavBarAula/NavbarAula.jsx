import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./NavbarAula.css";
import { clearAuthSession } from "../../services/api";

const NavbarAula = () => {
  const navigate = useNavigate();
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const handleSair = () => {
    setMostrarConfirmacao(true);
  };

  const cancelarSaida = () => {
    if (!saindo) {
      setMostrarConfirmacao(false);
    }
  };

  const confirmarSaida = () => {
    setSaindo(true);
    clearAuthSession();

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 650);
  };

  return (
    <>
      <header className="header">
        <h1>Xilonga Escola Virtual Angolana</h1>
        <nav>

          <Link to="/aula">Aula</Link>
          <Link to="/perfil">Perfil</Link>
        
          {/* Botão Sair com Ícone */}
          <button className="btn-sair" onClick={handleSair} aria-label="Sair da conta">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </nav>
      </header>

      {mostrarConfirmacao && (
        <div className="logout-feedback-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="logout-feedback">
            <span className="logout-feedback-icon" aria-hidden="true">
              <i className="fas fa-sign-out-alt"></i>
            </span>
            <h2 id="logout-title">Terminar sessão?</h2>
            <p>Ao sair, será necessário fazer login novamente para acessar as aulas e o perfil.</p>

            {saindo && <span className="logout-feedback-status">A terminar sessão...</span>}

            <div className="logout-feedback-actions">
              <button type="button" className="logout-cancel" onClick={cancelarSaida} disabled={saindo}>
                Cancelar
              </button>
              <button type="button" className="logout-confirm" onClick={confirmarSaida} disabled={saindo}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavbarAula;

    








