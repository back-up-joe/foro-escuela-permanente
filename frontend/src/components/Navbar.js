import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout, nivelActual, setNivelActual }) {
  const navigate = useNavigate();

  // Detectar si el usuario puede cambiar de nivel
  const puedeCambiarNivel = user?.perfil?.tipo_acceso === 'tipo3';

  // Nivel del usuario (para tipo1 y tipo2)
  const nivelUsuario = user?.perfil?.niveles_permitidos?.[0] || 1;

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

            {/* DROPDOWN DE USUARIO */}
            <li className="nav-item dropdown">
              <button
                className="nav-link btn btn-link dropdown-toggle"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.username || 'Usuario'}
              </button>
              <ul 
                className="dropdown-menu dropdown-menu-end user-dropdown" 
                aria-labelledby="userDropdown"
              >
                {/* Selector de nivel (solo para tipo3) */}
                {puedeCambiarNivel && (
                  <>
                    <li>
                      <h6 className="dropdown-header">
                        <i className="bi bi-layers me-1"></i>
                        Seleccionar Nivel
                      </h6>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${nivelActual === 1 ? 'active' : ''}`}
                        onClick={() => setNivelActual(1)}
                      >
                        <i className="bi bi-1-circle me-1"></i>
                        Nivel 1
                        {nivelActual === 1 && <i className="bi bi-check-lg ms-2"></i>}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${nivelActual === 2 ? 'active' : ''}`}
                        onClick={() => setNivelActual(2)}
                      >
                        <i className="bi bi-2-circle me-1"></i>
                        Nivel 2
                        {nivelActual === 2 && <i className="bi bi-check-lg ms-2"></i>}
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}

                {/* Indicador de nivel para tipo1 y tipo2 */}
                {!puedeCambiarNivel && user?.perfil && (
                  <>
                    <li>
                      <span className="dropdown-item-text text-muted">
                        <i className="bi bi-layers me-1"></i>
                        Nivel {nivelUsuario}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}

                {/* Cerrar sesión */}
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;