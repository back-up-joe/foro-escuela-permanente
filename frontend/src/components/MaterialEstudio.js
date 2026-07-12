import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';

function MaterialEstudio({ user, onLogout }) {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarMateriales();
  }, []);

  const cargarMateriales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://escueladecuadros.sytes.net/api/material-estudio/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMateriales(data);
      } else {
        setError('Error al cargar los materiales');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;

    // Si la URL es completa (empieza con http), cambiar http a https
    if (archivoPath.startsWith('http://')) {
        return archivoPath.replace('http://', 'https://');
    }

    // Si es https, devolverla tal cual
    if (archivoPath.startsWith('https://')) {
        return archivoPath;
    }

    if (archivoPath.startsWith('/media/')) {
      return `https://escueladecuadros.sytes.net${archivoPath}`;    }
    if (archivoPath.startsWith('media/')) {
      return `https://escueladecuadros.sytes.net${archivoPath}`;
    }
    return `https://escueladecuadros.sytes.net${archivoPath}`;
  };

  const handleDownload = (material) => {
    const url = getFileUrl(material.archivo);
    if (url) {
        window.open(url, '_blank');
    } else {
        setError('No se pudo obtener la URL del archivo');
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      {/* BANNER DE ANCHO COMPLETO */}
      <Banner />

      <div className="container foro-container">
        <div className="row">
          <div className="col-md-10 mx-auto">
            <div className="mb-4">
              <h2>
                <i className="bi bi-book me-2"></i>
                Material de Estudio
              </h2>
              <p className="text-muted">
                
              </p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando materiales...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : materiales.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-pdf display-1 text-muted"></i>
                <h4 className="mt-3">No hay materiales disponibles</h4>
                <p className="text-muted">
                  Los materiales de estudio se publicarán próximamente
                </p>
              </div>
            ) : (
              <div className="row">
                {materiales.map((material) => (
                  <div key={material.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow-sm hover-shadow">
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <div className="me-3">
                            <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="card-title mb-1">{material.titulo}</h5>
                            {material.descripcion && (
                              <p className="card-text text-muted small">
                                {material.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(material.fecha_subida).toLocaleDateString('es-CL')}
                            <span className="ms-2">
                              <i className="bi bi-file-earmark me-1"></i>
                              {material.tamaño_archivo || 'N/A'}
                            </span>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownload(material)}
                          >
                            <i className="bi bi-download me-1"></i>
                            Descargar
                          </button>
                        </div>
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

export default MaterialEstudio;