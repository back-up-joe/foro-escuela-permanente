import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';

function Enlaces({ user, onLogout }) {
  const [enlaces, setEnlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEnlaces();
  }, []);

  const cargarEnlaces = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      /*
      const response = await fetch('https://escueladecuadros.sytes.net/api/enlaces/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }, 
        
      COMENTAR PARA ENTORNO LOCAL  
        */
      const response = await fetch('http://localhost:8000/api/enlaces/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      
      });
      
      if (response.ok) {
        const data = await response.json();
        setEnlaces(data);
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
      <Navbar user={user} onLogout={onLogout} />
      <Banner />
      <div className="container foro-container">
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="mb-4">
              <h2>
                <i className="bi bi-link-45deg me-2"></i>
                Sesiones Online
              </h2>
              <p className="text-muted"></p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando enlaces...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : enlaces.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-link-45deg display-1 text-muted"></i>
                <h4 className="mt-3">No hay enlaces disponibles</h4>
                <p className="text-muted">Próximamente se agregarán enlaces</p>
              </div>
            ) : (
              <div className="row">
                {enlaces.map((enlace) => (
                  <div key={enlace.id} className="col-md-6 mb-4">
                    <div className="card h-100 shadow-sm hover-shadow">
                      <div className="card-body">
                        <h5 className="card-title">{enlace.titulo}</h5>
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
      <Footer />
    </>
  );
}

export default Enlaces;