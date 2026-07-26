import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';

function Cronograma({ user, onLogout }) {
  const [cronograma, setCronograma] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCronograma();
  }, []);

  const cargarCronograma = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      /*
      const response = await fetch('https://escueladecuadros.sytes.net/api/cronograma/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        
      COMENTAR PARA ENTORNO LOCAL
        
        */
      
      const response = await fetch('http://localhost:8000/api/cronograma/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      
      });
      
      if (response.ok) {
        const data = await response.json();
        setCronograma(data);
      } else {
        setError('Error al cargar el cronograma');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Banner />
      <div className="container foro-container">
        <div className="row">
          <div className="col-md-12">
            <div className="mb-4">
              <h2>
                <i className="bi bi-calendar me-2"></i>
                Cronograma
              </h2>
              <p className="text-muted">Calendario de sesiones y actividades</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando cronograma...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : cronograma.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar display-1 text-muted"></i>
                <h4 className="mt-3">No hay actividades programadas</h4>
                <p className="text-muted">El cronograma se publicará próximamente</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nivel</th>
                      <th>Módulo</th>
                      <th>Sesión</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Relator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronograma.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nivel}</td>
                        <td>{item.modulo}</td>
                        <td>{item.sesion}</td>
                        <td>
                          <span className={`badge ${item.tipo === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td>{new Date(item.fecha).toLocaleDateString('es-CL')}</td>
                        <td>
                          {item.inicio && item.termino ? 
                            `${item.inicio.substring(0,5)} - ${item.termino.substring(0,5)}` : 
                            '-'
                          }
                        </td>
                        <td>{item.relator || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Cronograma;