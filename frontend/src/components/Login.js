import React, { useState } from "react";
import { login } from "../services/api";
import SolicitarPasswordModal from "./SolicitarPasswordModal";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSolicitar, setMostrarSolicitar] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false); // ✅ NUEVO

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card text-center">
        <img
          src="/images/logo-partido.png"
          alt="Logo Partido Comunista"
          className="img-fluid"
        />
        <h2 className="mb-4">Escuela de Cuadros</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Contraseña con ojo */}
          <div className="mb-3">
            <div className="password-input-wrapper">
              <input
                type={mostrarPassword ? "text" : "password"}
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                tabIndex={-1}
                aria-label={
                  mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <i
                  className={`bi ${mostrarPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Enlace de olvido de contraseña */}
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-link p-0 text-muted small"
            onClick={() => setMostrarSolicitar(true)}
            style={{ textDecoration: "underline" }}
          >
            <i className="bi bi-key me-1"></i>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Modal de solicitar contraseña */}
      {mostrarSolicitar && (
        <SolicitarPasswordModal onClose={() => setMostrarSolicitar(false)} />
      )}
    </div>
  );
}

export default Login;
