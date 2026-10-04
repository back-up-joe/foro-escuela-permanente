import React, { useState } from 'react';
import Respuesta from './Respuesta';

function Comentario({ comentario, onLike, onResponder, usuarioActual }) {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [respuestaContenido, setRespuestaContenido] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState('');

  const [expandido, setExpandido] = useState(false); // Estado para controlar si el contenido está expandido o no

  // NUEVO: Configuración de plegado
  const MAX_CARACTERES = 300;  // Caracteres antes de plegar

  const MAX_CARACTERES_RESPUESTA = 1000;    // NUEVO: Límite de la respuesta

  const contenidoLargo = comentario.contenido && comentario.contenido.length > MAX_CARACTERES;
  const contenidoMostrar = expandido || !contenidoLargo
    ? comentario.contenido
    : comentario.contenido.substring(0, MAX_CARACTERES) + '...';

  /* Entorno local */
  // const API_BASE_URL = 'http://127.0.0.1:8000';
  
  
  // Producción
  const API_BASE_URL = 'https://escueladecuadros.sytes.net';

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

    // Validar longitud máxima
    if (respuestaContenido.length > MAX_CARACTERES_RESPUESTA) {
      setErrorRespuesta(`La respuesta no puede superar los ${MAX_CARACTERES_RESPUESTA} caracteres`);
      return;
    }
    
    // Limpiar error y enviar
    setErrorRespuesta('');
    onResponder(comentario.id, respuestaContenido);
    setRespuestaContenido('');
    setMostrarFormulario(false);
  };

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;

    // Si ya es URL completa, devolverla (Descomentar para producción)
    if (archivoPath.startsWith('http://')) {
        return archivoPath.replace('http://', 'https://');
    }

    // para local
    /*
    if (archivoPath.startsWith('http://')) {
        return archivoPath;
    }*/

    if (archivoPath.startsWith('https://')) {
        return archivoPath;
    }

    // Si el path ya comienza con /media/, usarlo directamente PRODUCCIÓN
    if (archivoPath.startsWith('/media/')) {
        return `https://escueladecuadros.sytes.net${archivoPath}`;
    }

    //Local
    /*
    if (archivoPath.startsWith('/media/')) {
        return `${API_BASE_URL}${archivoPath}`;
    }*/

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

    // return `${API_BASE_URL}/media${cleanPath}`;
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
      
      {/* CONTENIDO CON PLEGADO */}
      <div className="comentario-contenido">
        <div className={`comentario-texto ${!expandido && contenidoLargo ? 'plegado' : ''}`}>
          {contenidoMostrar}
        </div>
        
        {contenidoLargo && (
          <button
            className="btn-ver-mas"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? (
              <>
                <i className="bi bi-chevron-up me-1"></i>
                Ver menos
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down me-1"></i>
                Ver más
              </>
            )}
          </button>
        )}
      </div>

      {/*
      <div className="comentario-contenido">
        {comentario.contenido}
      </div> */}

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

      {/* Formulario de respuesta CON LÍMITE */}
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
                  // ✅ Limitar entrada a MAX_CARACTERES_RESPUESTA
                  if (e.target.value.length <= MAX_CARACTERES_RESPUESTA) {
                    setRespuestaContenido(e.target.value);
                    if (errorRespuesta) setErrorRespuesta('');
                  }
                }}
                maxLength={MAX_CARACTERES_RESPUESTA}  // ✅ Límite HTML
              />
              <button type="submit" className="btn btn-primary">
                Responder
              </button>
            </div>

            {/* ✅ NUEVO: Contador de caracteres y error */}
            <div className="d-flex justify-content-between align-items-center mt-1">
              {errorRespuesta && (
                <div className="text-danger small">{errorRespuesta}</div>
              )}
              <small className={`ms-auto ${
                respuestaContenido.length > MAX_CARACTERES_RESPUESTA * 0.9 
                  ? 'text-danger fw-bold' 
                  : 'text-muted'
              }`}>
                {respuestaContenido.length} / {MAX_CARACTERES_RESPUESTA}
              </small>
            </div>
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