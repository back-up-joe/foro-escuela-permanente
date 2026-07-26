import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import { createInforme, getInformes } from '../services/api';

function Informes({ user, onLogout }) {
  const [informes, setInformes] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Obtener la URL base desde variables de entorno
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    cargarInformes();
  }, []);

  const cargarInformes = async () => {
    try {
      const data = await getInformes();
      setInformes(data);
    } catch (err) {
      console.error('Error cargando informes:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      setError('Debes escribir un título');
      return;
    }
    
    if (!archivo) {
      setError('Debes seleccionar un archivo PDF');
      return;
    }

    // Validar que sea PDF
    if (archivo.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        titulo: titulo,
        descripcion: descripcion,
        archivo: archivo,
      };
      await createInforme(data);
      setTitulo('');
      setDescripcion('');
      setArchivo(null);
      // Resetear input file
      document.getElementById('archivoInput').value = '';
      await cargarInformes();
    } catch (err) {
      setError('Error al subir el informe. Máximo 20MB');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;
    
    /* Descomentar para producción */
    if (archivoPath.startsWith('http://')) {
      return archivoPath.replace('http://', 'https://');
    }

    // Comentar para producción
    /*
    if (archivoPath.startsWith('http://')) {
      return archivoPath;
    }*/
  
    if (archivoPath.startsWith('https://')) {
      return archivoPath;
    }
    
    if (archivoPath.startsWith('/media/')) {
      return `https://escueladecuadros.sytes.net${archivoPath}`;
    }
    /* COMENTAR PARA LOCAL  
    */

    // Usar la URL base desde variables de entorno
    /*
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';
    
    // Si el path ya comienza con /media/, usarlo directamente
    if (archivoPath.startsWith('/media/')) {
      return `${baseUrl}${archivoPath}`;
    }*/

    let cleanPath = archivoPath;
    if (cleanPath.startsWith('media/')) {
      cleanPath = cleanPath.substring(6);
    }
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    
    return `https://escueladecuadros.sytes.net/media${cleanPath}`;
    //return `${baseUrl}/media${cleanPath}`;
  };

  const handleDownload = (informe) => {
    const url = getFileUrl(informe.archivo);
    if (url) {
      window.open(url, '_blank');
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
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Entrega de Informes
              </h2>
              <p className="text-muted"></p>
            </div>

            {/* Formulario de subida */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Subir Informe</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Título del informe"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Descripción (opcional)"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      id="archivoInput"
                      type="file"
                      className="form-control"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setArchivo(e.target.files[0])}
                    />
                    <small className="text-muted">Solo PDF - Máximo 20MB</small>
                  </div>
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Subiendo...' : 'Subir Informe'}
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de informes */}
            {informes.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-file-earmark-pdf display-1"></i>
                <p className="mt-3">No hay informes subidos aún</p>
              </div>
            ) : (
              <div className="row">
                {informes.map((informe) => (
                  <div key={informe.id} className="col-md-6 mb-3">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-start">
                          <div className="me-3">
                            <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="card-title mb-1">{informe.titulo}</h6>
                            <p className="card-text text-muted small">
                              {informe.descripcion || 'Sin descripción'}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <i className="bi bi-person me-1"></i>
                                {informe.usuario.username}
                                <span className="ms-2">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(informe.fecha_subida).toLocaleString('es-CL')}
                                </span>
                              </small>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleDownload(informe)}
                              >
                                <i className="bi bi-download me-1"></i>
                                Descargar
                              </button>
                            </div>
                          </div>
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

export default Informes;