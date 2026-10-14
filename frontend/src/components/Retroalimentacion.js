import React, { useState } from 'react';

function Retroalimentacion({ retroalimentacion, usuarioActual }) {
  const [expandido, setExpandido] = useState(false);

  const MAX_CARACTERES_PLEGADO = 300;

  const contenidoLargo = retroalimentacion.comentario && 
    retroalimentacion.comentario.length > MAX_CARACTERES_PLEGADO;
  const contenidoMostrar = expandido || !contenidoLargo
    ? retroalimentacion.comentario
    : retroalimentacion.comentario.substring(0, MAX_CARACTERES_PLEGADO) + '...';

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;
    
    if (archivoPath.startsWith('http://') || archivoPath.startsWith('https://')) {
      if (window.location.protocol === 'https:' && archivoPath.startsWith('http://')) {
        return archivoPath.replace('http://', 'https://');
      }
      return archivoPath;
    }

    const baseUrl = process.env.REACT_APP_BASE_URL || 
      `${window.location.protocol}//${window.location.hostname}:8000`;
    
    const API_BASE_URL = window.location.protocol === 'https:' 
      ? baseUrl.replace('http://', 'https://')
      : baseUrl;

    if (archivoPath.startsWith('/media/')) {
      return `${API_BASE_URL}${archivoPath}`;
    }

    let cleanPath = archivoPath;
    if (cleanPath.startsWith('media/')) {
      cleanPath = cleanPath.substring(6);
    }
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    return `${API_BASE_URL}/media${cleanPath}`;
  };

  const handleDownload = () => {
    const url = getFileUrl(retroalimentacion.archivo);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="retroalimentacion-card">
      <div className="retroalimentacion-header">
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-square-text me-2"></i>
          <strong className="retroalimentacion-usuario">
            {retroalimentacion.usuario?.username || 'Usuario'}
          </strong>
        </div>
        <span className="comentario-fecha">
          {new Date(retroalimentacion.fecha_creacion).toLocaleString('es-CL')}
        </span>
      </div>

      <div className="retroalimentacion-contenido">
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

      {retroalimentacion.archivo && (
        <div className="retroalimentacion-archivo mt-2">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleDownload}
          >
            <i className="bi bi-file-pdf me-1"></i>
            Ver PDF adjunto
          </button>
          <span className="ms-2 text-muted small">
            {retroalimentacion.nombre_archivo}
          </span>
        </div>
      )}
    </div>
  );
}

export default Retroalimentacion;