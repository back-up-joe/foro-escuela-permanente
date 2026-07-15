import React, { useState } from 'react';
import Respuesta from './Respuesta';

function Comentario({ comentario, onLike, onResponder, usuarioActual }) {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [respuestaContenido, setRespuestaContenido] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState('');

  const handleLike = () => {
    onLike(comentario.id);
  };

  const handleResponder = (e) => {
    e.preventDefault();
    
    // Validación: el contenido de la respuesta no puede estar vacío
    if (!respuestaContenido.trim()) {
      setErrorRespuesta('El comentario no puede estar vacío');
      return;
    }
    
    // Limpiar error y enviar
    setErrorRespuesta('');
    onResponder(comentario.id, respuestaContenido);
    setRespuestaContenido('');
    setMostrarFormulario(false);
  };

  // Función para obtener la URL completa del archivo
  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;
    if (archivoPath.startsWith('http')) return archivoPath;

    {/*
    if (archivoPath.startsWith('/media/')) {
      return `https://escueladecuadros.sytes.net${archivoPath}`;
    }
    if (archivoPath.startsWith('media/')) {
      return `https://escueladecuadros.sytes.net/${archivoPath}`;
    }
    return `https://escueladecuadros.sytes.net/media/${archivoPath}`;/ */}

    const getFileUrl = (archivoPath) => {
  if (!archivoPath) return null;
  if (archivoPath.startsWith('http')) return archivoPath;
  
  // Normalizar la ruta
  let cleanPath = archivoPath;
  // Eliminar /media/ o media/ si existe
  if (cleanPath.startsWith('/media/')) {
    cleanPath = cleanPath.substring(7);
  } else if (cleanPath.startsWith('media/')) {
    cleanPath = cleanPath.substring(6);
  }
  
  // Asegurar que la ruta comience con /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Para archivos en /opt/media/
  return `https://escueladecuadros.sytes.net/media${cleanPath}`;
};








  };

  return (
    <div className="comentario-card">
      <div className="comentario-header">
        <span className="comentario-usuario">
          {comentario.usuario?.username || 'Usuario'}
        </span>
        <span className="comentario-fecha">
          {new Date(comentario.fecha_creacion).toLocaleString('es-CL')}
        </span>
      </div>
      
      <div className="comentario-contenido">
        {comentario.contenido}
      </div>

      {comentario.archivo && (
        <div className="mt-2 mb-2">
          <a 
            href={getFileUrl(comentario.archivo)}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
            onClick={(e) => {
              const url = getFileUrl(comentario.archivo);
              window.open(url, '_blank');
              e.preventDefault();
            }}
          >
            <i className="bi bi-file-pdf me-1"></i>
            Ver PDF
          </a>
          <span className="ms-2 text-muted small">
            {comentario.archivo.split('/').pop()}
          </span>
        </div>
      )}

      <div className="comentario-actions">
        <button 
          className={`btn btn-sm ${comentario.usuario_ha_dado_like ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={handleLike}
        >
          <i className="bi bi-heart-fill me-1"></i>
          {comentario.total_likes} {comentario.total_likes === 1 ? 'Like' : 'Likes'}
        </button>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <i className="bi bi-reply me-1"></i>
          Responder
        </button>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setMostrarRespuesta(!mostrarRespuesta)}
        >
          <i className="bi bi-chat-dots me-1"></i>
          {comentario.respuestas?.length || 0} Respuestas
        </button>
      </div>

      {/* Formulario de respuesta */}
      {mostrarFormulario && (
        <form onSubmit={handleResponder} className="mt-3">
          <div className="mb-2">
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${errorRespuesta ? 'is-invalid' : ''}`}
                placeholder="Escribe tu respuesta..."
                value={respuestaContenido}
                onChange={(e) => {
                  setRespuestaContenido(e.target.value);
                  if (errorRespuesta) setErrorRespuesta('');
                }}
              />
              <button type="submit" className="btn btn-primary">
                Responder
              </button>
            </div>
            {errorRespuesta && (
              <div className="text-danger small mt-1">
                {errorRespuesta}
              </div>
            )}
          </div>
          <div className="text-end">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setMostrarFormulario(false);
                setErrorRespuesta('');
                setRespuestaContenido('');
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Respuestas */}
      {mostrarRespuesta && comentario.respuestas && comentario.respuestas.length > 0 && (
        <div className="respuesta-container">
          {comentario.respuestas.map((respuesta) => (
            <Respuesta 
              key={respuesta.id} 
              respuesta={respuesta} 
              usuarioActual={usuarioActual}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comentario;