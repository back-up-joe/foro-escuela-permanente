import React, { useState, useEffect } from 'react';

function Banner() {
  const imagenes = [
    {
      src: '/images/banner-final-mujeres.png',
      alt: 'Banner Escuela Cuadros 1'
    },
    {
      src: '/images/banner-final.png',
      alt: 'Banner Escuela Cuadros 2'
    }
  ];

  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % imagenes.length);
    }, 12000);

    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  return (
    <div className="banner-foro">
      <div className="banner-carousel">
        {imagenes.map((imagen, index) => (
          <img
            key={index}
            src={imagen.src}
            alt={imagen.alt}
            className={`banner-slide ${index === indiceActual ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default Banner;