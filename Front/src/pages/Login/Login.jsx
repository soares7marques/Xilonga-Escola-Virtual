import React, { useState } from 'react';
import './Login.css';

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import '../../App.css';
import { API_BASE_URL, setAuthSession } from '../../services/api';


const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/utilizador/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
      });
      
      const data = await response.json();
      console.log('Resposta do LOGIN:', data);

      if (data.success && data.token) {
        const userData = {
          email: data.email,
          role: data.role,
          expiresAt: data.expiresAt
        };

        setAuthSession({
          token: data.token,
          email: data.email,
          role: data.role,
          expiresAt: data.expiresAt
        });
        login();
        setSuccess('login realizado com sucesso! Redirecionando...');
          setTimeout(() => {
          switch(data.role) {
            case 'ALUNO':
              navigate('/perfil',{ replace: true, state: userData });
              break;
            case 'ADMIN':
              navigate('/dashboard_admin',{ replace: true, state: userData });
              break;
            case 'PROFESSOR':  
              navigate('/dashboard_Professor',{ replace: true, state: userData });
              break;
            }
          }, 1500);
      } else {
        setError(data.error || 'Email ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-layout">
      <Navbar />
      <div className="login-container">
        <main className="Login-main-content">
          <div className="Login-image-section">
            <img src="/imagem/imagem1.jpeg" alt="Criança estudando" />
          </div>

          <div className="Login-form-section">
            <div className="login-box">
              <h2>Já tem cadastro?</h2>
              <p>Faça o seu login</p>
              <form onSubmit={handleLogin}>
                {/* Input Email com ícone */}
                <div className="Login-input-group">
                  <i className="fas fa-envelope input-icon"></i>
                  <input 
                    type="email" 
                    placeholder="Endereço de E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {/* Input Senha com ícone */}
                <div className="Login-input-group">
                  <i className="fas fa-lock input-icon"></i>
                  <input 
                    type="password" 
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="Login-btn-login" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
                  {success && (
                    <div style={{ color: '#16a34a', marginTop: '10px', fontWeight: 'bold' }}>{success}</div>
                  )}
                  {error && (
                    <div style={{ color: '#dc2626', marginTop: '10px', fontWeight: 'bold' }}>{error}</div>
                  )}

              </form>
              <div className="Login-links">
                <Link to="/cadastro" className="Login-create-account-link">
                  <i className="fas fa-user-plus" aria-hidden="true"></i>
                  <span>Criar Conta</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
