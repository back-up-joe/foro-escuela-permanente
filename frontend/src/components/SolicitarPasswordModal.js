import React from 'react';

function SolicitarPasswordModal({ onClose }) {
  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className="modal-card-header">
          <h5 className="mb-0">
            <i className="bi bi-envelope-paper me-2"></i>
            Solicitar nueva contraseña
          </h5>
          <button className="btn-close-custom" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-card-body">
          <p className="text-muted small mb-3">
            <i className="bi bi-info-circle me-1"></i>
            Completa el formulario y el administrador del foro se pondrá en contacto contigo en un máximo de 48 horas.
          </p>

          <form
            action="https://formspree.io/f/myeklrgk"
            method="POST"
            className="contacto-form"
          >
            <div className="mb-3">
              <label className="form-label small">
                <i className="bi bi-person me-1"></i>
                Ingresar usuario
              </label>
              <input
                type="text"
                className="form-control"
                name="usuario"
                placeholder="Ingresa tu nombre de usuario"
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-send me-1"></i>
                Enviar solicitud
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SolicitarPasswordModal;