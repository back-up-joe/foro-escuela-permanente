import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import { getProximaSesion } from '../services/api';

function Enlaces({ user, onLogout, nivelActual, setNivelActual }) {
  const [enlaces, setEnlaces] = useState([]);
  const [proximaSesion, setProximaSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detectar si el usuario puede cambiar de nivel
  const puedeCambiarNivel = user?.perfil?.tipo_acceso === 'tipo3';

  // Constante de URL (cambiar al pasar a producción)
  // const API_BASE_URL = 'http://localhost:8000/api/';
  // const API_BASE_URL = 'https://escueladecuadros.sytes.net/api/'; /* Descomentar para producción */

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    cargarEnlaces();
  }, [nivelActual]);

  const cargarEnlaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');

      // Cargar la próxima sesión - sesión onlibe en vivo
      const proximaData = await getProximaSesion(
        puedeCambiarNivel ? nivelActual : null
      );
      setProximaSesion(proximaData.proxima);

      // Construir la URL según el nivel
      const url = puedeCambiarNivel && nivelActual
        ? `${API_BASE_URL}enlaces/?nivel=${nivelActual}`
        : `${API_BASE_URL}enlaces/`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },      
      });
      
      if (response.ok) {
        const data = await response.json();
        // Excluir la que ya se muestra como próxima sesión
        const filtrados = data.filter(e => !e.es_proxima_sesion);

        setEnlaces(filtrados);
      } else {
        setError('Error al cargar los enlaces');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={onLogout}
        nivelActual={nivelActual}
        setNivelActual={setNivelActual}
      />
      <Banner />
      <div className="container foro-container">
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="mb-4">
              <h2>
                <i className="bi bi-link-45deg me-2"></i>
                Sesiones Online - Nivel {nivelActual}
              </h2>
              <p className="text-muted"></p>
            </div>

            {/* ========== PANEL DESTACADO: PRÓXIMA SESIÓN ========== */}
            {!loading && (
              <div className="proxima-sesion-panel mb-5">
                {proximaSesion ? (
                  <div className="proxima-sesion-card">
                    <div className="proxima-sesion-badge">
                      <i className="bi bi-broadcast"></i>
                      PRÓXIMA SESIÓN
                    </div>
                    <div className="proxima-sesion-content">
                      <div className="proxima-sesion-icon">
                        <i className="bi bi-camera-video-fill"></i>
                      </div>
                      <div className="proxima-sesion-info">
                        <h4 className="proxima-sesion-title">{proximaSesion.titulo}</h4>
                        {proximaSesion.descripcion && (
                          <p className="proxima-sesion-desc">{proximaSesion.descripcion}</p>
                        )}
                        <a
                          href={proximaSesion.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-light proxima-sesion-btn"
                        >
                          <i className="bi bi-box-arrow-up-right me-2"></i>
                          Unirse a la clase
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="proxima-sesion-empty">
                    <i className="bi bi-hourglass-split"></i>
                    <p className="mb-0">Aún no se publica el link de la próxima clase</p>
                  </div>
                )}
              </div>
            )}


            {/* ========== LISTADO DE CLASES GRABADAS ========== */}
            <div className="mt-5">
              <h4 className="mb-3">
                <i className="bi bi-collection-play me-2"></i>
                Clases Grabadas
              </h4>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Cargando enlaces...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : enlaces.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-link-45deg display-1 text-muted"></i>
                  <h4 className="mt-3">No hay clases grabadas disponibles</h4>
                  <p className="text-muted">Próximamente se agregarán enlaces</p>
                </div>
              ) : (
                <div className="row">
                  {enlaces.map((enlace) => (
                    <div key={enlace.id} className="col-md-6 mb-4">
                      <div className="card h-100 shadow-sm hover-shadow">
                        <div className="card-body">
                          <h5 className="card-title">{enlace.titulo}</h5>

                          {puedeCambiarNivel && (
                            <span className="badge bg-secondary mb-2">
                              Nivel {enlace.nivel}
                            </span>
                          )}

                          {enlace.descripcion && (
                            <p className="card-text text-muted">{enlace.descripcion}</p>
                          )}
                          <a
                            href={enlace.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Ver enlace
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}

export default Enlaces;