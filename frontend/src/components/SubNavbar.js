import React from 'react';

function SubNavbar() {
  return (
    
    <nav className="sub-navbar py-3">
      <div className="container">
        <ul className="sub-navbar-nav">
          <li>
            <a href="https://linternadepapel.cl" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-newspaper me-1"></i>
              Linterna de Papel
            </a>
          </li>
          <li>
            <a href="https://resistenciainformativa.org" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-shield-check me-1"></i>
              Resistencia Informativa
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default SubNavbar;