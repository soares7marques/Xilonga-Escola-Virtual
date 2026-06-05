import './Footer.css';


const Footer = () => {
  return (      
    <footer className="footer">
        <div className="footer-column">
          <p>Plataforma de Educação à Distância modular e escalável para alunos em Angola de 7ª á 8ª</p>
          <div className="social-icons">
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
            <a href="#"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Recursos</h3>
          <ul>
            <li><a href="#">Documentação</a></li>
            <li><a href="#">Central de Ajuda</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Política de Privacidade</a></li>
            <li><a href="#">Termos de Serviço</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Sobre Nós</h3>
          <ul>
            <li><a href="#">Missão</a></li>
            <li><a href="#">Equipa</a></li>
            <li><a href="#">Parcerias</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Subscrição</h3>
          <p>Inscreva-se para receber atualizações sobre novos cursos e funcionalidades</p>
        </div>
      </footer>
  );
};

export default Footer;
    
    
    
    
    
    
    
