import React from 'react';

function Banner() {
  return (
    <div className="banner-foro">
      <img 
        src="/images/banner-ivan-ljubetic3.png" 
        alt="Banner Escuela Cuadros" 
        className="img-fluid w-100"
        style={{ 
          display: 'block',
          width: '100%',
          height: 'auto',
          maxHeight: '430px',
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

export default Banner;