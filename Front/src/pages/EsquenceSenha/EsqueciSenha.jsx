import React, { useState } from 'react';
import './EsqueciSenha.css';
import { Link } from "react-router-dom";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import '../../App.css';

const EsqueciSenha = () => {
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/auth/esqueci-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'SMS enviado com sucesso! Verifique seu telefone.');
        setMessageType('success');
      } else {
        setMessage(data.error || 'Erro ao enviar SMS. Tente novamente.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro de conexão. Verifique sua internet e tente novamente.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-senha-container">
        <Navbar />
      {/* Main Content */}
      <main className="esqueci-mainContent">
        <div className="esqueci-image-section">
          <img src="/imagem/imagem1.jpeg" alt="Recuperação de senha" />
        </div>

        <div className="esqueci-formSection">
          <div className="esqueci-reset-box">
            <div className="esqueci-reset-header">
              <i className="fas fa-key reset-icon"></i>
              <h2>Recuperar Senha</h2>
              <p>Digite seu email para receber a senha via SMS</p>
            </div>
            
            <form onSubmit={handleForgotPassword}>
              {message && (
                <div className={`message ${messageType}`}>
                  <i className={messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}></i>
                  {message}
                </div>
              )}
              
              <div className="esqueci-inputGroup">
                <i className="fas fa-envelope input-icon"></i>
                <input 
                  type="email" 
                  placeholder="Seu email cadastrado"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="esqueci-btn-reset"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i>
                    Enviando SMS...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" style={{marginRight: '8px'}}></i>
                    Enviar SMS
                  </>
                )}
              </button>

              <div className="security-info">
                <i className="fas fa-shield-alt"></i>
                <span><strong>Seguro:</strong> Usando Twilio para envio seguro de SMS</span>
              </div>

              <div className="back-to-login">
                <Link to="/login">
                  <i className="fas fa-arrow-left"></i>
                  Voltar ao Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Steps Info */}
      <section className="steps-section">
        <div className="steps-container">
          <h3>Como funciona a recuperação?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h4>1. Digite seu email</h4>
              <p>Informe o email usado no cadastro</p>
            </div>
            
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <h4>2. Verificamos sua conta</h4>
              <p>Procuramos seu perfil no sistema</p>
            </div>
            
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-sms"></i>
              </div>
              <h4>3. Enviamos SMS</h4>
              <p>Sua senha chegará no telefone cadastrado</p>
            </div>
            
            <div className="step">
              <div className="step-icon">
                <i className="fas fa-sign-in-alt"></i>
              </div>
              <h4>4. Faça login</h4>
              <p>Use a senha recebida para acessar</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="faq-container">
          <h3>Dúvidas Frequentes</h3>
          <div className="faq-grid">
            <div className="faq-item">
              <h4><i className="fas fa-question-circle"></i> Não recebo o SMS?</h4>
              <p>Verifique se o número está correto no seu cadastro e se há sinal de rede.</p>
            </div>
            
            <div className="faq-item">
              <h4><i className="fas fa-clock"></i> Quanto tempo demora?</h4>
              <p>O SMS chega em alguns segundos. Se demorar, tente novamente.</p>
            </div>
            
            <div className="faq-item">
              <h4><i className="fas fa-phone"></i> Mudei de número?</h4>
              <p>Entre em contato conosco para atualizar seu telefone.</p>
            </div>
            
            <div className="faq-item">
              <h4><i className="fas fa-envelope"></i> Email não cadastrado?</h4>
              <p>Verifique se digitou corretamente ou crie uma nova conta.</p>
            </div>
          </div>
        </div>
      </section>
        <Footer />
    </div>
  );
};

export default EsqueciSenha;