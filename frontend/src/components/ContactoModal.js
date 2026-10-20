import React, { useState } from "react";

function ContactoModal({ onClose }) {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setEnviado(true);
        form.reset();
      } else {
        alert("Error al enviar el mensaje. Intenta nuevamente.");
      }
    } catch (err) {
      alert("Error de conexión. Intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop-custom"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "450px" }}
      >
        <div className="modal-card-header">
          <h5 className="mb-0">
            <i className="bi bi-envelope-paper me-2"></i>
            Formulario de contacto
          </h5>
          <button className="btn-close-custom" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-card-body">
          {enviado ? (
            <div className="text-center py-4">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "3rem" }}
              ></i>
              <h5 className="mt-3 text-success">¡Mensaje enviado!</h5>
              <p className="text-muted">
                Gracias por tu consulta. Te responderemos a la brevedad.
              </p>
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={onClose}
              >
                <i className="bi bi-check-lg me-1"></i>
                Aceptar
              </button>
            </div>
          ) : (
            <form
              action="https://formspree.io/f/xgaoqwne"
              method="POST"
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <label className="form-label small">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="usuario"
                  placeholder="Tu nombre de usuario"
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Tu correo electrónico"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Comentario</label>
                <textarea
                  className="form-control"
                  name="comentario"
                  rows="4"
                  placeholder="Escribe tu mensaje..."
                  required
                />
              </div>

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
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1"></i>
                      Enviar mensaje
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

export default ContactoModal;
