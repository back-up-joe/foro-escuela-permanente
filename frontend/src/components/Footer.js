import React, { useState } from "react";
import ContactoModal from "./ContactoModal";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [mostrarContacto, setMostrarContacto] = useState(false);

  return (
    <>
      <footer className="text-center py-5 mt-5">
        <div className="container">
          <p className="mb-0">
            © {currentYear} - Escuela Permanente de Cuadros - Comunal Ñuñoa
          </p>

          <p className="mb-0 small mt-2">
            <a
              href="https://linternadepapel.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-decoration-none"
            >
              linternadepapel.cl
            </a>
            {" | "}
            <a
              href="https://resistenciainformativa.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-decoration-none"
            >
              resistenciainformativa.org
            </a>
          </p>

          {/* Botón para abrir el modal */}
          <div className="mt-3">
            <button
              className="btn btn-link text-white p-0 small"
              onClick={() => setMostrarContacto(true)}
              style={{ textDecoration: "underline" }}
            >
              <i className="bi bi-envelope-paper me-1"></i>
              Formulario de contacto
            </button>

            <span className="text-white small mx-4">|</span>
            
              <a
                href="https://drive.google.com/drive/folders/12hVBnAntmHyN3zT6Rsh0EmesQGwskPIh?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link text-white p-0 small"
                style={{ textDecoration: "underline" }}
              >
                <i className="bi bi-book me-1"></i>
                  Tutorial de uso del Foro
              </a>

          </div>
        </div>
      </footer>

      {/* Modal de contacto */}
      {mostrarContacto && (
        <ContactoModal onClose={() => setMostrarContacto(false)} />
      )}
    </>
  );
}

export default Footer;
