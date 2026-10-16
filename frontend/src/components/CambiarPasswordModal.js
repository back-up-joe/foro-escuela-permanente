import React, { useState } from "react";

function CambiarPasswordModal({ onClose, API_BASE_URL }) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmacion, setPasswordConfirmacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Detectar clic en el backdrop (no en el modal)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Campos requeridos
    if (!passwordActual || !passwordNueva || !passwordConfirmacion) {
      setError("Todos los campos son requeridos");
      return;
    }

    // 2. La nueva no puede ser igual a la actual
    if (passwordActual === passwordNueva) {
      setError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    // 3. Las nuevas deben coincidir
    if (passwordNueva !== passwordConfirmacion) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    // 4. Longitud mínima
    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    // 5. Debe contener al menos una letra
    if (!/[a-zA-Z]/.test(passwordNueva)) {
      setError("La nueva contraseña debe contener al menos una letra");
      return;
    }

    // 6. Debe contener al menos un número
    if (!/\d/.test(passwordNueva)) {
      setError("La nueva contraseña debe contener al menos un número");
      return;
    }

    // 7. Debe contener al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(passwordNueva)) {
      setError(
        "La nueva contraseña debe contener al menos un carácter especial (!@#$%^&*...)",
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}cambiar-password/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password_actual: passwordActual,
          password_nueva: passwordNueva,
          password_confirmacion: passwordConfirmacion,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.error || "Error al cambiar la contraseña");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={handleBackdropClick}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "450px" }}
      >
        <div className="modal-card-header">
          <h5 className="mb-0">
            <i className="bi bi-key me-2"></i>
            Cambiar Contraseña
          </h5>
          <button className="btn-close-custom" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-card-body">
          {success ? (
            <div className="text-center py-4">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5 className="mt-3 text-success">¡Contraseña cambiada!</h5>
              <p className="text-muted">
                Tu contraseña se ha actualizado correctamente.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small">Contraseña actual</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña actual"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Mínimo 8 caracteres"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-info-circle me-1"></i>
                  Debe contener: letras, números y caracteres especiales (mínimo 8 caracteres)
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label small">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repite la nueva contraseña"
                  value={passwordConfirmacion}
                  onChange={(e) => setPasswordConfirmacion(e.target.value)}
                />
              </div>

              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {error}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Cambiando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Cambiar contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CambiarPasswordModal;
