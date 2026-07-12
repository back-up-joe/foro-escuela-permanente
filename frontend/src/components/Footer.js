import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-5 mt-5">
      <div className="container">
        
        <p className="mb-0">
          © {currentYear} - Escuela Permanente de Cuadros - Comunal Ñuñoa
        </p>
        <p className="mb-0 small">
          
        </p>
      </div>
    </footer>
  );
}

export default Footer;