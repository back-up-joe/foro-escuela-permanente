import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Banner from "./Banner";
import Retroalimentacion from "./Retroalimentacion";
import { createInforme, getInformes } from "../services/api";

function Informes({ user, onLogout, nivelActual, setNivelActual }) {
  const [informes, setInformes] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // NUEVOS estados para retroalimentación
  const [retroalimentaciones, setRetroalimentaciones] = useState({});
  const [mostrarFormRetro, setMostrarFormRetro] = useState(null);
  const [comentarioRetro, setComentarioRetro] = useState("");
  const [archivoRetro, setArchivoRetro] = useState(null);
  const [loadingRetro, setLoadingRetro] = useState(false);
  const [errorRetro, setErrorRetro] = useState("");

  // Detectar si puede crear retroalimentaciones
  const puedeCrearRetro = user?.perfil?.tipo_acceso === "tipo3";

  // Detectar si el usuario puede cambiar de nivel
  const puedeCambiarNivel = user?.perfil?.tipo_acceso === "tipo3";

  const MAX_CARACTERES_RETRO = 3000;

  // Obtener la URL base desde variables de entorno
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    cargarInformes();
  }, [nivelActual]);

  const cargarRetroalimentaciones = async (informeId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}retroalimentaciones/?informe=${informeId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.ok) {
        const data = await response.json();
        setRetroalimentaciones((prev) => ({ ...prev, [informeId]: data }));
      }
    } catch (err) {
      console.error("Error cargando retroalimentaciones:", err);
    }
  };

  const cargarInformes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const url =
        puedeCambiarNivel && nivelActual
          ? `${API_BASE_URL}informes/?nivel=${nivelActual}`
          : `${API_BASE_URL}informes/`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInformes(data);

        // Cargar retroalimentaciones para cada informe
        data.forEach((informe) => cargarRetroalimentaciones(informe.id));
      } else {
        setError("Error al cargar los informes");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ENVÍO DE INFORME
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError("Debes escribir un título");
      return;
    }

    if (!archivo) {
      setError("Debes seleccionar un archivo PDF");
      return;
    }

    if (archivo.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        titulo: titulo,
        descripcion: descripcion,
        archivo: archivo,
        nivel: nivelActual,
      };
      await createInforme(data);
      setTitulo("");
      setDescripcion("");
      setArchivo(null);
      const fileInput = document.getElementById("archivoInput");
      if (fileInput) fileInput.value = "";
      await cargarInformes();
    } catch (err) {
      setError("Error al subir el informe. Máximo 20MB");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRetro = async (e, informeId) => {
    e.preventDefault();

    if (!comentarioRetro.trim()) {
      setErrorRetro("El comentario no puede estar vacío");
      return;
    }

    if (comentarioRetro.length > MAX_CARACTERES_RETRO) {
      setErrorRetro(
        `El comentario no puede superar los ${MAX_CARACTERES_RETRO} caracteres`,
      );
      return;
    }

    setLoadingRetro(true);
    setErrorRetro("");

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("informe", informeId);
      formData.append("comentario", comentarioRetro);
      if (archivoRetro) {
        formData.append("archivo", archivoRetro);
      }

      const response = await fetch(`${API_BASE_URL}retroalimentaciones/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setComentarioRetro("");
        setArchivoRetro(null);
        setMostrarFormRetro(null);
        await cargarRetroalimentaciones(informeId);
      } else {
        setErrorRetro("Error al crear la retroalimentación");
      }
    } catch (err) {
      setErrorRetro("Error de conexión");
    } finally {
      setLoadingRetro(false);
    }
  };

  const getFileUrl = (archivoPath) => {
    if (!archivoPath) return null;

    /* Descomentar para producción
    if (archivoPath.startsWith('http://')) {
      return archivoPath.replace('http://', 'https://');
    } */

    // Comentar para producción
    if (archivoPath.startsWith("http://")) {
      return archivoPath;
    }

    if (archivoPath.startsWith("https://")) {
      return archivoPath;
    }
    /*
    if (archivoPath.startsWith('/media/')) {
      return `https://escueladecuadros.sytes.net${archivoPath}`;
    }
    COMENTAR PARA LOCAL  
    */

    // Usar la URL base desde variables de entorno
    const baseUrl = process.env.REACT_APP_BASE_URL;

    // Si el path ya comienza con /media/, usarlo directamente
    if (archivoPath.startsWith("/media/")) {
      return `${baseUrl}${archivoPath}`;
    }

    let cleanPath = archivoPath;
    if (cleanPath.startsWith("media/")) {
      cleanPath = cleanPath.substring(6);
    }
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }

    //return `https://escueladecuadros.sytes.net/media${cleanPath}`;
    return `${baseUrl}/media${cleanPath}`;
  };

  const handleDownload = (informe) => {
    const url = getFileUrl(informe.archivo);
    if (url) {
      window.open(url, "_blank");
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
          <div className="col-md-10 mx-auto">
            <div className="mb-4">
              <h2>
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Entrega de Informes - Nivel {nivelActual}
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
                  {error && <div className="alert alert-danger">{error}</div>}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Subiendo..." : "Subir Informe"}
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
                  <div key={informe.id} className="col-md-12 mb-3">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        {/* ✅ INFO DEL INFORME (esto faltaba) */}
                        <div className="d-flex align-items-start">
                          <div className="me-3">
                            <i
                              className="bi bi-file-pdf text-danger"
                              style={{ fontSize: "2rem" }}
                            ></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="card-title mb-1">
                              {informe.titulo}
                            </h6>
                            {puedeCambiarNivel && (
                              <span className="badge bg-secondary mb-2">
                                Nivel {informe.nivel}
                              </span>
                            )}
                            <p className="card-text text-muted small">
                              {informe.descripcion || "Sin descripción"}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <i className="bi bi-person me-1"></i>
                                {informe.usuario.username}
                                <span className="ms-2">
                                  <i className="bi bi-clock me-1"></i>
                                  {new Date(
                                    informe.fecha_subida,
                                  ).toLocaleString("es-CL")}
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

                        {/* Sección de retroalimentación */}
                        <div className="retroalimentacion-section mt-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>
                              <i className="bi bi-chat-square-text me-1"></i>
                              Retroalimentaciones (
                              {retroalimentaciones[informe.id]?.length || 0})
                            </strong>
                            {puedeCrearRetro && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  setMostrarFormRetro(
                                    mostrarFormRetro === informe.id
                                      ? null
                                      : informe.id,
                                  );
                                  setErrorRetro("");
                                }}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Agregar retroalimentación
                              </button>
                            )}
                          </div>

                          {mostrarFormRetro === informe.id &&
                            puedeCrearRetro && (
                              <form
                                onSubmit={(e) =>
                                  handleSubmitRetro(e, informe.id)
                                }
                                className="mb-3"
                              >
                                <textarea
                                  className="form-control mb-2"
                                  rows="3"
                                  placeholder="Escribe tu retroalimentación..."
                                  value={comentarioRetro}
                                  onChange={(e) => {
                                    if (
                                      e.target.value.length <=
                                      MAX_CARACTERES_RETRO
                                    ) {
                                      setComentarioRetro(e.target.value);
                                      if (errorRetro) setErrorRetro("");
                                    }
                                  }}
                                  maxLength={MAX_CARACTERES_RETRO}
                                />
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <input
                                    type="file"
                                    className="form-control form-control-sm"
                                    accept=".pdf"
                                    onChange={(e) =>
                                      setArchivoRetro(e.target.files[0])
                                    }
                                    style={{ maxWidth: "300px" }}
                                  />
                                  <small
                                    className={
                                      comentarioRetro.length >
                                      MAX_CARACTERES_RETRO * 0.9
                                        ? "text-danger"
                                        : "text-muted"
                                    }
                                  >
                                    {comentarioRetro.length} /{" "}
                                    {MAX_CARACTERES_RETRO}
                                  </small>
                                </div>
                                {errorRetro && (
                                  <div className="alert alert-danger py-2 mb-2">
                                    {errorRetro}
                                  </div>
                                )}
                                <div className="text-end">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary me-2"
                                    onClick={() => {
                                      setMostrarFormRetro(null);
                                      setComentarioRetro("");
                                      setArchivoRetro(null);
                                      setErrorRetro("");
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="btn btn-sm btn-primary"
                                    disabled={loadingRetro}
                                  >
                                    {loadingRetro
                                      ? "Enviando..."
                                      : "Enviar retroalimentación"}
                                  </button>
                                </div>
                              </form>
                            )}

                          {retroalimentaciones[informe.id]?.length > 0 ? (
                            retroalimentaciones[informe.id].map((retro) => (
                              <Retroalimentacion
                                key={retro.id}
                                retroalimentacion={retro}
                                usuarioActual={user}
                              />
                            ))
                          ) : (
                            <p className="text-muted small mb-0">
                              <i className="bi bi-info-circle me-1"></i>
                              No hay retroalimentaciones aún
                            </p>
                          )}
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
