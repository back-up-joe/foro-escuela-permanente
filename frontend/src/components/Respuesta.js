import React, { useState } from 'react';
import { likeRespuesta } from '../services/api';

function Respuesta({ respuesta, usuarioActual }) {
  const [likes, setLikes] = useState(respuesta.total_likes || 0);
  const [usuarioHaDadoLike, setUsuarioHaDadoLike] = useState(respuesta.usuario_ha_dado_like || false);
  const [expandido, setExpandido] = useState(false); // Estado para controlar si el contenido está expandido o no

  // NUEVO: Configuración de plegado
  const MAX_CARACTERES_PLEGADO = 200;  // Caracteres antes de plegar en respuestas

  const contenidoLargo = respuesta.contenido && respuesta.contenido.length > MAX_CARACTERES_PLEGADO;
  const contenidoMostrar = expandido || !contenidoLargo
    ? respuesta.contenido
    : respuesta.contenido.substring(0, MAX_CARACTERES_PLEGADO) + '...';

  const handleLike = async () => {
    try {
      const data = await likeRespuesta(respuesta.id);
      setLikes(data.total_likes);
      setUsuarioHaDadoLike(data.liked);
    } catch (err) {
      console.error('Error al dar like a respuesta:', err);
    }
  };

  return (
    <div className="respuesta-card">
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <strong className="comentario-usuario">
            {respuesta.usuario.username}
          </strong>
          
          {/* ✅ CONTENIDO CON PLEGADO */}
          <div className="respuesta-contenido">
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
        </div>
        
        <span className="comentario-fecha ms-2">
          {new Date(respuesta.fecha_creacion).toLocaleString('es-CL')}
        </span>
      </div>
      
      <div className="mt-2">
        <button 
          className={`btn btn-sm ${usuarioHaDadoLike ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={handleLike}
        >
          <i className="bi bi-heart-fill me-1"></i>
          {likes} {likes === 1 ? 'Like' : 'Likes'}
        </button>
      </div>
    </div>
  );
}

export default Respuesta;