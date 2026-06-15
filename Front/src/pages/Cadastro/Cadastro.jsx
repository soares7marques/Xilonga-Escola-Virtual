// src/pages/Cadastro.js
import React, { useState } from 'react';
import './Cadastro.css';
import { Link, useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import '../../App.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    genero: ''

  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lista de tipos de procedimento comuns em Angola
const OPCOES = [
  { value: "", label: "Selecione o Genero" },
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
];

  // Função para atualizar os dados do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar mensagens ao digitar
    setError('');
    setSuccess('');
  };


  // procTipo agora é sincronizado com formData.genero
  // Função para enviar os dados do formulário
  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        telefone: formData.telefone,
        genero: formData.genero
      };

      console.log('Enviando dados para cadastro:', payload);

      const response = await fetch('http://localhost:8080/aluno/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Resposta do cadastro:', data);

      if (response.ok) {
        // Corrige para acessar data.body se necessário
        const body = data.body || data;
        const userData = {
          email: (body.Email || formData.email)
        };
        setSuccess('Cadastro realizado com sucesso! Faça login para continuar.');
        setTimeout(() => {
          navigate('/login', { replace: true, state: userData });
        }, 2000);
      } else {
        setError(data.error || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

                return (
                  <div className="cadastro-page-layout">
                    <Navbar />
                    <div className="cadastro-container">
                      <main className="cadastro-main_content">
                        <div className="cadastro-image-section">
                          <img src="/imagem/imagem1.jpeg" alt="Criança estudando" />
                        </div>

                        <div className="-cadastro-form_section">
                          <div className="cadastro-box">
                            <h2>Crie sua conta grátis</h2>
                            <p>Preencha os seus dados</p>
                            {/* Mensagem de Erro Profissional */}
                            {error && (
                              <div style={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{ color: '#dc2626', fontSize: '20px' }}>⚠️</div>
                                <div style={{ color: '#dc2626', fontSize: '14px', fontWeight: '500' }}>
                                  {error}
                                </div>
                              </div>
                            )}
                            {/* Mensagem de Sucesso Profissional */}
                            {success && (
                              <div style={{
                                backgroundColor: '#dcfce7',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <div style={{ color: '#16a34a', fontSize: '20px' }}>✅</div>
                                <div style={{ color: '#16a34a', fontSize: '14px', fontWeight: '500' }}>
                                  {success}
                                </div>
                              </div>
                            )}
                            <form onSubmit={handleCadastro}>
                              <div className="cadastro-input_group">
                                <i className="fas fa-user input-icon"></i>
                                <input 
                                  type="text" 
                                  name="nome"
                                  placeholder="Nome do Usuário" 
                                  value={formData.nome}
                                  onChange={handleInputChange}
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div className="cadastro-input_group">
                                <i className="fas fa-envelope input-icon"></i>
                                <input 
                                  type="email" 
                                  name="email"
                                  placeholder="Endereço de E-mail" 
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div className="cadastro-input_group">
                                <i className="fas fa-phone input-icon"></i>
                                <input 
                                  type="tel" 
                                  name="telefone"
                                  placeholder="Contacto (9 dígitos)" 
                                  value={formData.telefone}
                                  onChange={handleInputChange}
                                  pattern="^9\d{8}$"
                                  title="Telefone deve ter 9 dígitos e começar com 9"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div className="cadastro-input_group">
                                <i className="fas fa-venus-mars input-icon"></i>
                                <select
                                  id="genero"
                                  name="genero"
                                  className="cadastro-input_group"
                                  value={formData.genero}
                                  onChange={handleInputChange}
                                  required
                                >
                                  {OPCOES.map((opcao) => (
                                    <option key={opcao.value} value={opcao.value}>
                                      {opcao.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="cadastro-input_group">
                                <i className="fas fa-lock input-icon"></i>
                                <input 
                                  type="password" 
                                  name="senha"
                                  placeholder="Senha (mínimo 6 caracteres)" 
                                  value={formData.senha}
                                  onChange={handleInputChange}
                                  minLength="6"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <div className="cadastro-input_group">
                                <i className="fas fa-lock input-icon"></i>
                                <input 
                                  type="password" 
                                  name="senha"
                                  placeholder="Confirmar Senha (mínimo 6 caracteres)" 
                                  value={formData.senha}
                                  onChange={handleInputChange}
                                  minLength="6"
                                  required
                                  disabled={loading}
                                />
                              </div>

                              <button 
                                type="submit" 
                                className="btn-cadastrar"
                                disabled={loading}
                                style={{
                                  opacity: loading ? 0.7 : 1,
                                  cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
                              </button>
                            </form>
                            <p className="cadastro-terms">
                              Ao clicar em "criar conta", declaro que aceito as Políticas de Privacidade e os Termos de Uso da Aura Academy.
                            </p>
                            <div className="cadastro-links">
                              <span>já tenho conta.</span> <Link to="/login">Fazer login.</Link>
                            </div>
                          </div>
                        </div>
                      </main>
                    </div>
                    <Footer />
                  </div>
                );
};

export default Cadastro;
