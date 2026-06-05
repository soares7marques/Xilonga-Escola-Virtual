// src/pages/Inicio.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Inicio.css';
import '../../App.css';

    const Inicio = () => {
      return (
        <div className="inicio-page-layout">
          <div className="inicio-container-inicio">
            <Navbar />
            <section className="inicio-hero-section">
              <div className="inicio-hero-content">
                <h2>Ensino Primário e do Iº Ciclo do Ensino Secundário</h2>
                <p>
                  plataforma educacional digital criada para apoiar o
                  processo de ensino aprendizagem em Angola
                </p>
                <div className="inicio-hero-buttons">
                  <Link to="/login" className="inicio-btn-primary">Começar Agora</Link>
                </div>
              </div>
              <div className="inicio-hero-image">
                <img src="/imagem/aluno.jpeg" alt="Estudantes angolanos estudando" />
              </div>
            </section>

            {/* Seção de Recursos / Funcionalidades */}
            <section id="recursos" className="inicio-features-section">
              <div className="inicio-feature-card">
                <h3>Proposito</h3>
                <p>
                Apoiar o processo de ensino e aprendizagem por meio de ferramentas digitais
                modernas.
                </p>
              </div>
              <div className="inicio-feature-card">
                <h3>Motivação</h3>
                <p>
                Cada linha de código desse sistema pode ser a ponte entre a pobreza e o futuro
                brilhante de um estudante.
                </p>
              </div>
              <div className="inicio-feature-card">
                <h3>Materiais de Estudo</h3>
                <p>
                  Repositório completo com materias em videos, por níveis e simulado.
                </p>
              </div>
            </section>


            {/* Depoimento */}
            <section className="inicio-testimonial-section">
              <blockquote>
                “Este sistema representa uma oportunidade transformadora. O conhecimento não deve estar limitado às grandes cidades ou às famílias com renda alta.”
              </blockquote>
              <div className="inicio-testimonial-author">
                <img src="/imagem/Equipa.png" alt="Equipa Aura Academy" />
                <div>
                  <strong>Equipa: Estudantes de 4º U.A.N</strong>
                  <p>Desenvolvimento Educacional</p>
                </div>
              </div>
            </section>
          </div>
          <Footer />
        </div>
      );
    };
export default Inicio;