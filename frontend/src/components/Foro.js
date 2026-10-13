import React, { useState, useEffect } from 'react';
import { getComentarios, createComentario, likeComentario, responderComentario } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';
import Comentario from './Comentario';
import Banner from './Banner';

function Foro({ user, onLogout, nivelActual, setNivelActual }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_CARACTERES = 2000;

  useEffect(() => {
    cargarComentarios();
  }, [nivelActual]);  // ← Recargar cuando cambia el nivel

  const cargarComentarios = async () => {
    try {
      const data = await getComentarios(nivelActual);
      setComentarios(data);
    } catch (err) {
      console.error('Error cargando comentarios:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (nuevoComentario.length > MAX_CARACTERES) {
      setError(`El comentario no puede superar los ${MAX_CARACTERES} caracteres`);
      return;
    }
    
    if (!nuevoComentario.trim() && !archivo) {
      setError('Debes escribir un comentario o subir un archivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = {
        contenido: nuevoComentario,
        archivo: archivo,
        nivel: nivelActual,  // ENVIAR NIVEL ACTUAL
      };
      await createComentario(data);
      setNuevoComentario('');
      setArchivo(null);
      const fileInput = document.getElementById('archivoInput');
      if (fileInput) fileInput.value = '';
      await cargarComentarios();
    } catch (err) {
      setError('Error al crear el comentario');
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

  const handleResponder = async (id, contenido, nivel) => {
    try {
      await responderComentario(id, contenido, nivel);
      await cargarComentarios();
    } catch (err) {
      console.error('Error al responder:', err);
    }
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
          <div className="col-md-8 mx-auto">
            <div className="mb-4">
              <h2>
                <i className="bi bi-chat-dots me-2"></i>
                Foro {nivelActual && `- Nivel ${nivelActual}`}
              </h2>
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
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_CARACTERES) {
                          setNuevoComentario(e.target.value);
                          if (error) setError('');
                        }
                      }}
                      maxLength={MAX_CARACTERES}
                    />
                    <div className="d-flex justify-content-end mt-1">
                      <small className={nuevoComentario.length > MAX_CARACTERES * 0.9 ? 'text-danger' : 'text-muted'}>
                        {nuevoComentario.length} / {MAX_CARACTERES}
                      </small>
                    </div>
                  </div>
                  <div className="mb-3">
                    <input
                      id="archivoInput"
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
                    disabled={loading || nuevoComentario.length > MAX_CARACTERES}
                  >
                    {loading ? 'Publicando...' : 'Publicar'}
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de comentarios */}
            {comentarios.length === 0 ? (
              <div className="text-center text-muted py-5">
                <p>No hay comentarios en este nivel aún.</p>
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