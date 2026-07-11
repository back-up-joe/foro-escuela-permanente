import React, { useState } from 'react';
import { likeRespuesta } from '../services/api';

function Respuesta({ respuesta, usuarioActual }) {
  const [likes, setLikes] = useState(respuesta.total_likes || 0);
  const [usuarioHaDadoLike, setUsuarioHaDadoLike] = useState(respuesta.usuario_ha_dado_like || false);

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
        <div>
          <strong className="comentario-usuario">
            {respuesta.usuario.username}
          </strong>
          <p className="mb-1">{respuesta.contenido}</p>
        </div>
        <span className="comentario-fecha">
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