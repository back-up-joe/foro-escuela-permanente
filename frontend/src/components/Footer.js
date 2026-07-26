import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
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
          {' | '}
          <a
            href="https://resistenciainformativa.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-decoration-none"

          >
            resistenciainformativa.org
          </a>
        </p>

        <p className="mb-0 small">
          
        </p>
      </div>
    </footer>
  );
}

export default Footer;