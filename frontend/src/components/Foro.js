import React, { useState, useEffect } from 'react';
import { getComentarios, createComentario, likeComentario, responderComentario } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';
import Comentario from './Comentario';
import Banner from './Banner';

function Foro({ user, onLogout }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarComentarios();
  }, []);

  const cargarComentarios = async () => {
    try {
      const data = await getComentarios();
      setComentarios(data);
    } catch (err) {
      console.error('Error cargando comentarios:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() && !archivo) {
      setError('Debes escribir un comentario');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        contenido: nuevoComentario,
        archivo: archivo,
      };
      await createComentario(data);
      setNuevoComentario('');
      setArchivo(null);
      await cargarComentarios();
    } catch (err) {
      setError('Debes escribir comentario o el archivo adjunto es demasiado grande (máx 20MB)');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      await likeComentario(id);
      await cargarComentarios();
    } catch (err) {
      console.error('Error al dar like:', err);
    }
  };

  const handleResponder = async (id, contenido) => {
    try {
      await responderComentario(id, contenido);
      await cargarComentarios();
    } catch (err) {
      console.error('Error al responder:', err);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      {/* BANNER DE ANCHO COMPLETO */}
      <Banner />

      <div className="container foro-container">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="mb-4">              
              <h2>
                <i className="bi bi-chat-dots me-2"></i>
                Foro</h2>
              <p className="text-muted">Compartir comentarios y documentos</p>
            </div>

            {/* Formulario de nuevo comentario */}
            <div className="card mb-4">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Escribir comentario..."
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) => setArchivo(e.target.files[0])}
                    />
                    <small className="text-muted">PDF máximo 20MB</small>
                  </div>
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Publicando...' : 'Publicar'}
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de comentarios */}
            {comentarios.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No hay comentarios aún.</p>
              </div>
            ) : (
              comentarios.map((comentario) => (
                <Comentario
                  key={comentario.id}
                  comentario={comentario}
                  onLike={handleLike}
                  onResponder={handleResponder}
                  usuarioActual={user}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Foro;