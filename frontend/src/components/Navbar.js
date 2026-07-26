import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/foro">
          <img 
            src="/images/logo-partido.png" 
            alt="Logo" 
            height="40" 
            className="d-inline-block align-top me-2"
          />          
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ marginLeft: '20%' }}  // <-- DESPLAZAR HAMBURGUESA 20% AL CENTRO
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/foro">
                <i className="bi bi-chat-dots me-1"></i>
                Foro
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/informes">
                <i className="bi bi-file-earmark-pdf me-1"></i>
                Informes
              </Link>
            </li>

            

            
            <li className="nav-item">
              <Link className="nav-link" to="/enlaces">
                <i className="bi bi-link-45deg me-1"></i>
                Sesiones
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/material-estudio">
                <i className="bi bi-book me-1"></i>
                Material de Estudio
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/cronograma">
                <i className="bi bi-calendar me-1"></i>
                Cronograma
              </Link>
            </li>

            <li className="nav-item">
              <span className="nav-link">
                <i className="bi bi-person-circle me-1"></i>
                {user?.username || 'Usuario'}
              </span>
            </li>
            
            <li className="nav-item">
              <button 
                className="nav-link btn btn-link" 
                onClick={handleLogout}
                style={{ color: 'white', textDecoration: 'none' }}
              >
                <i className="bi bi-box-arrow-right me-1"></i>
                Cerrar Sesión
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;