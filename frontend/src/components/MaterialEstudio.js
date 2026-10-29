import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import { getMateriales, createMaterial, getFiltrosMateriales } from '../services/api';

function MaterialEstudio({ user, onLogout, nivelActual, setNivelActual }) {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filtroModulo, setFiltroModulo] = useState('');
  const [filtroSesion, setFiltroSesion] = useState('');
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [sesionesDisponibles, setSesionesDisponibles] = useState([]);

  // Formulario de subida (solo tipo3)
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [modulo, setModulo] = useState('');
  const [sesion, setSesion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loadingSubida, setLoadingSubida] = useState(false);
  const [errorSubida, setErrorSubida] = useState('');

  const puedeCambiarNivel = user?.perfil?.tipo_acceso === 'tipo3';
  const puedeSubir = user?.perfil?.tipo_acceso === 'tipo3';

  useEffect(() => {
    cargarMateriales();
    cargarFiltros();
  }, [nivelActual, filtroModulo, filtroSesion]);

  const cargarMateriales = async () => {
    setLoading(true);
    try {
      const data = await getMateriales(
        puedeCambiarNivel ? nivelActual : null,
        filtroModulo || null,
        filtroSesion || null
      );
      setMateriales(data);
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarFiltros = async () => {
    try {
      const data = await getFiltrosMateriales(puedeCambiarNivel ? nivelActual : null);
      setModulosDisponibles(data.modulos || []);
      setSesionesDisponibles(data.sesiones || []);
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorSubida('');

    if (!titulo.trim()) {
      setErrorSubida('El título es obligatorio');
      return;
    }
    if (!archivo) {
      setErrorSubida('Debes seleccionar un archivo');
      return;
    }

    setLoadingSubida(true);
    try {
      await createMaterial({
        titulo,
        descripcion,
        modulo,
        sesion,
        archivo,
        nivel: nivelActual,
      });

      // Reset
      setTitulo('');
      setDescripcion('');
      setModulo('');
      setSesion('');
      setArchivo(null);

      const fileInput = document.getElementById('archivoMaterialInput');
      if (fileInput) fileInput.value = '';
      setMostrarForm(false);

      // NUEVO: resetear filtros para asegurar que el nuevo material sea visible
      setFiltroModulo('');
      setFiltroSesion('');

      // CRÍTICO: recargar lista de materiales y filtros
      console.log('Recargando lista...');
    
      await cargarMateriales();
      await cargarFiltros();

      console.log('Lista recargada');

    } catch (err) {

      console.error('Error subida:', err.response?.data || err);

      setErrorSubida('Error al subir el material. Verifica el archivo (máx 20MB).');
      console.error(err);
    } finally {
      setLoadingSubida(false);
    }
  };

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;

    // Si ya es URL completa, devolverla (Descomentar para producción)
    
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

    // Si el path ya comienza con /media/, usarlo directamente
    
    // if (archivoPath.startsWith('http://') || archivoPath.startsWith('https://')) {
      // return archivoPath;
    // }
    const baseUrl = process.env.REACT_APP_BASE_URL;
    
    // if (archivoPath.startsWith('/media/')) {
      // return `${baseUrl}${archivoPath}`;
    // }
    /*
    COMENTAR PARA LOCAL    
  

    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

    if (archivoPath.startsWith('/media/')) {
        return `${baseUrl}${archivoPath}`;
    } */

    ////////////////////////////////////////////////////////////////////////

    // Para rutas como "material_estudio/archivo.pdf" o "comentarios/archivo.pdf"
    // Asegurar que la ruta comience con /
    let cleanPath = archivoPath;
    
    // Eliminar posibles prefijos
    if (cleanPath.startsWith('media/')) {
        cleanPath = cleanPath.substring(6);
    }
    if (cleanPath.startsWith('/app/media/')) {
        cleanPath = cleanPath.substring(10);
    }
    
    // Asegurar que la ruta comience con /
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    return `https://escueladecuadros.sytes.net/media${cleanPath}`;
    // Para desarrollo local
    // return `${baseUrl}/media${cleanPath}`;
};

  const handleDownload = (material) => {
    const url = getFileUrl(material.archivo);
    if (url) window.open(url, '_blank');
    else setError('No se pudo obtener la URL del archivo');
  };

  const limpiarFiltros = () => {
    setFiltroModulo('');
    setFiltroSesion('');
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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
              <div>
                <h2>
                  <i className="bi bi-book me-2"></i>
                  Material de Estudio - Nivel {nivelActual}
                </h2>
                <p className="text-muted mb-0"></p>
              </div>
              {puedeSubir && (
                <button
                  className="btn btn-primary"
                  onClick={() => setMostrarForm(!mostrarForm)}
                >
                  <i className={`bi ${mostrarForm ? 'bi-x-lg' : 'bi-plus-circle'} me-1`}></i>
                  {mostrarForm ? 'Cancelar' : 'Subir material'}
                </button>
              )}
            </div>

            {/* Formulario de subida (solo tipo3) */}
            {puedeSubir && mostrarForm && (
              <div className="card mb-4 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="bi bi-cloud-upload me-2"></i>
                    Nuevo material
                  </h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label small">Título *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder=""
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Módulo *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={modulo}
                          onChange={(e) => setModulo(e.target.value)}
                          placeholder="Ej: 1"
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label small">Sesión *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sesion}
                          onChange={(e) => setSesion(e.target.value)}
                          placeholder="Ej: 3"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Subtítulo *</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder=""
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small">Archivo *</label>
                        <input
                          id="archivoMaterialInput"
                          type="file"
                          className="form-control"
                          onChange={(e) => setArchivo(e.target.files[0])}
                        />
                        <small className="text-muted">Máximo 20MB</small>
                      </div>
                    </div>

                    {errorSubida && (
                      <div className="alert alert-danger mt-3 mb-0 py-2">{errorSubida}</div>
                    )}

                    <div className="mt-3 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setMostrarForm(false)}
                        disabled={loadingSubida}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loadingSubida}
                      >
                        {loadingSubida ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-upload me-1"></i>
                            Subir material
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filtros */}
            <div className="card mb-4 border-0 shadow-sm">
              <div className="card-body py-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      <i className="bi bi-funnel me-1"></i>Módulo
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={filtroModulo}
                      onChange={(e) => setFiltroModulo(e.target.value)}
                    >
                      <option value="">Todos los módulos</option>
                      {modulosDisponibles.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">
                      <i className="bi bi-funnel me-1"></i>Sesión
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={filtroSesion}
                      onChange={(e) => setFiltroSesion(e.target.value)}
                    >
                      <option value="">Todas las sesiones</option>
                      {sesionesDisponibles.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={limpiarFiltros}
                      disabled={!filtroModulo && !filtroSesion}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Limpiar filtro
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Cargando materiales...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : materiales.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-pdf display-1 text-muted"></i>
                <h4 className="mt-3">No hay materiales disponibles</h4>
                <p className="text-muted">
                  {filtroModulo || filtroSesion
                    ? 'No hay materiales con los filtros seleccionados'
                    : 'Los materiales de estudio se publicarán próximamente'}
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

                            <div className="d-flex flex-wrap gap-1 mb-2">
                              {puedeCambiarNivel && (
                                <span className="badge bg-secondary">Nivel {material.nivel}</span>
                              )}
                              {material.modulo && (
                                <span className="badge bg-light text-dark border">
                                  <i className="bi bi-bookmark me-1"></i>Mód. {material.modulo}
                                </span>
                              )}
                              {material.sesion && (
                                <span className="badge bg-light text-dark border">
                                  <i className="bi bi-calendar-check me-1"></i>Sesión {material.sesion}
                                </span>
                              )}
                            </div>

                            {material.descripcion && (
                              <p className="card-text text-muted small">{material.descripcion}</p>
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