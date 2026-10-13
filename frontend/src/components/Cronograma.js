import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';

function Cronograma({ user, onLogout, nivelActual, setNivelActual }) {
  const [cronograma, setCronograma] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vistaActual, setVistaActual] = useState('calendario'); // 'calendario' | 'lineal'
  const [mesActual, setMesActual] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  const puedeCambiarNivel = user?.perfil?.tipo_acceso === 'tipo3';
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    cargarCronograma();
  }, [nivelActual]);

  const cargarCronograma = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const url = puedeCambiarNivel && nivelActual
        ? `${API_BASE_URL}cronograma/?nivel=${nivelActual}`
        : `${API_BASE_URL}cronograma/`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCronograma(data);
        // Establecer el primer mes disponible
        if (data.length > 0) {
          const primerMes = data[0].fecha.substring(0, 7);
          setMesActual(primerMes);
        }
      } else {
        setError('Error al cargar el cronograma');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Formatear fecha
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // ✅ Formatear hora
  const formatHora = (horaStr) => {
    if (!horaStr) return '-';
    return horaStr.substring(0, 5);
  };

  // ✅ Nombre del mes
  const getNombreMes = (yearMonth) => {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[parseInt(month) - 1]} ${year}`;
  };

  // ✅ Lista de meses únicos
  const mesesUnicos = [...new Set(cronograma.map(item => item.fecha.substring(0, 7)))].sort();

  // ✅ Filtrar por tipo
  const cronogramaFiltrado = cronograma.filter(item => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
    return true;
  });

  // ✅ Generar calendario
  const generarCalendario = (yearMonth) => {
    if (!yearMonth) return null;
    const [year, month] = yearMonth.split('-').map(Number);
    const primerDia = new Date(year, month - 1, 1);
    const ultimoDia = new Date(year, month, 0).getDate();
    const diaSemanaInicio = primerDia.getDay(); // 0 = Domingo

    const dias = [];
    // Días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= ultimoDia; i++) {
      dias.push(i);
    }

    return { dias, year, month };
  };

  // ✅ Obtener sesiones de un día específico
  const getSesionesDelDia = (yearMonth, dia) => {
    const fechaStr = `${yearMonth}-${String(dia).padStart(2, '0')}`;
    return cronogramaFiltrado.filter(item => item.fecha === fechaStr);
  };

  // ✅ Agrupar por módulo para vista lineal
  const agruparPorModulo = () => {
    const grupos = {};
    cronogramaFiltrado.forEach(item => {
      const key = item.modulo || 'Sin módulo';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(item);
    });
    // Ordenar cada grupo por fecha
    Object.keys(grupos).forEach(key => {
      grupos[key].sort((a, b) => a.fecha.localeCompare(b.fecha));
    });
    return grupos;
  };

  const calendario = generarCalendario(mesActual);
  const grupos = agruparPorModulo();
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <>
      <Navbar
        user={user}
        onLogout={onLogout}
        nivelActual={nivelActual}
        setNivelActual={setNivelActual}
      />
      <Banner />
      <div className="container foro-container">
        <div className="row">
          <div className="col-md-12">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <div>
                <h2 className="mb-1">
                  <i className="bi bi-calendar-event me-2"></i>
                  Cronograma - Nivel {nivelActual}
                </h2>
                <p className="text-muted mb-0">Calendario de sesiones y actividades</p>
              </div>
              {/* Selector de vista */}
              <div className="btn-group mt-3 mt-md-0" role="group">
                <button
                  type="button"
                  className={`btn ${vistaActual === 'calendario' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setVistaActual('calendario')}
                >
                  <i className="bi bi-calendar3 me-1"></i>
                  Calendario
                </button>
                <button
                  type="button"
                  className={`btn ${vistaActual === 'lineal' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setVistaActual('lineal')}
                >
                  <i className="bi bi-list-ul me-1"></i>
                  Lista
                </button>
              </div>
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
              <>
                {/* Estadísticas */}
                <div className="row mb-4">
                  <div className="col-md-4 col-6 mb-2">
                    <div className="stat-card stat-total">
                      <div className="stat-number">{cronograma.length}</div>
                      <div className="stat-label">Total sesiones</div>
                    </div>
                  </div>
                  <div className="col-md-4 col-6 mb-2">
                    <div className="stat-card stat-presencial">
                      <div className="stat-number">{cronograma.filter(i => i.tipo === 'presencial').length}</div>
                      <div className="stat-label">Presenciales</div>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-2">
                    <div className="stat-card stat-virtual">
                      <div className="stat-number">{cronograma.filter(i => i.tipo === 'virtual').length}</div>
                      <div className="stat-label">Virtuales</div>
                    </div>
                  </div>
                </div>

                {/* Filtros */}
                <div className="card mb-4 border-0 shadow-sm">
                  <div className="card-body py-3">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">
                          <i className="bi bi-funnel me-1"></i>Filtrar por tipo
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={filtroTipo}
                          onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                          <option value="todos">Todas las sesiones</option>
                          <option value="presencial">Solo presenciales</option>
                          <option value="virtual">Solo virtuales</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== VISTA CALENDARIO ========== */}
                {vistaActual === 'calendario' && (
                  <>
                    {/* Navegación de meses */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          const idx = mesesUnicos.indexOf(mesActual);
                          if (idx > 0) setMesActual(mesesUnicos[idx - 1]);
                        }}
                        disabled={mesesUnicos.indexOf(mesActual) <= 0}
                      >
                        <i className="bi bi-chevron-left"></i> Anterior
                      </button>
                      <h4 className="mb-0 text-center">{getNombreMes(mesActual)}</h4>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          const idx = mesesUnicos.indexOf(mesActual);
                          if (idx < mesesUnicos.length - 1) setMesActual(mesesUnicos[idx + 1]);
                        }}
                        disabled={mesesUnicos.indexOf(mesActual) >= mesesUnicos.length - 1}
                      >
                        Siguiente <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>

                    {/* Calendario */}
                    <div className="card shadow-sm mb-4">
                      <div className="card-body p-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="calendar-grid">
                          {/* Cabecera de días */}
                          {diasSemana.map(dia => (
                            <div key={dia} className="calendar-header-cell">
                              {dia}
                            </div>
                          ))}
                          {/* Días del mes */}
                          {calendario.dias.map((dia, idx) => {
                            if (dia === null) {
                              return <div key={`empty-${idx}`} className="calendar-cell empty"></div>;
                            }
                            const sesiones = getSesionesDelDia(mesActual, dia);
                            const tieneSesiones = sesiones.length > 0;
                            return (
                              <div
                                key={dia}
                                className={`calendar-cell ${tieneSesiones ? 'has-event' : ''}`}
                                onClick={() => tieneSesiones && setSesionSeleccionada(sesiones[0])}
                              >
                                <div className="calendar-day">{dia}</div>
                                {tieneSesiones && (
                                  <div className="calendar-events">
                                    {sesiones.slice(0, 2).map(s => (
                                      <div
                                        key={s.id}
                                        className={`calendar-event-dot ${s.tipo === 'presencial' ? 'dot-presencial' : 'dot-virtual'}`}
                                        title={s.titulo || s.sesion}
                                      ></div>
                                    ))}
                                    {sesiones.length > 2 && (
                                      <div className="calendar-more">+{sesiones.length - 2}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Leyenda */}
                    <div className="d-flex justify-content-center gap-4 mb-4">
                      <div className="d-flex align-items-center">
                        <div className="legend-dot dot-presencial me-2"></div>
                        <small>Presencial</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="legend-dot dot-virtual me-2"></div>
                        <small>Virtual</small>
                      </div>
                    </div>

                    {/* Sesiones del mes */}
                    <h5 className="mb-3">
                      <i className="bi bi-list-check me-2"></i>
                      Sesiones de {getNombreMes(mesActual)}
                    </h5>
                    <div className="row">
                      {cronogramaFiltrado
                        .filter(item => item.fecha.startsWith(mesActual))
                        .map(sesion => (
                          <div key={sesion.id} className="col-md-6 mb-3">
                            <div className={`sesion-card ${sesion.tipo === 'presencial' ? 'card-presencial' : 'card-virtual'}`}>
                              <div className="sesion-card-header">
                                <span className={`badge ${sesion.tipo === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                                  <i className={`bi ${sesion.tipo === 'presencial' ? 'bi-building' : 'bi-camera-video'} me-1`}></i>
                                  {sesion.tipo}
                                </span>
                                <span className="sesion-card-fecha">{formatFecha(sesion.fecha)}</span>
                              </div>
                              <div className="sesion-card-body">
                                <h6 className="mb-2">
                                  <span className="sesion-modulo">Módulo {sesion.modulo}</span>
                                  <span className="sesion-num ms-2">Sesión {sesion.sesion}</span>
                                </h6>
                                <div className="sesion-info">
                                  <div><i className="bi bi-clock me-1"></i>{formatHora(sesion.inicio)} - {formatHora(sesion.termino)}</div>
                                  {sesion.relator && (
                                    <div><i className="bi bi-person-circle me-1"></i>{sesion.relator}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}

                {/* ========== VISTA LINEAL ========== */}
                {vistaActual === 'lineal' && (
                  <>
                    {Object.entries(grupos).map(([modulo, sesiones]) => (
                      <div key={modulo} className="modulo-group mb-4">
                        <div className="modulo-header">
                          <h5 className="mb-0">
                            <i className="bi bi-bookmark-fill me-2"></i>
                            Módulo {modulo}
                          </h5>
                          <span className="badge bg-secondary">{sesiones.length} sesiones</span>
                        </div>
                        <div className="modulo-timeline">
                          {sesiones.map((sesion, idx) => (
                            <div key={sesion.id} className="timeline-item">
                              <div className={`timeline-dot ${sesion.tipo === 'presencial' ? 'dot-presencial' : 'dot-virtual'}`}></div>
                              <div className="timeline-content">
                                <div className="d-flex justify-content-between align-items-start flex-wrap">
                                  <div>
                                    <div className="d-flex align-items-center mb-1 flex-wrap gap-2">
                                      <strong className="timeline-sesion">Sesión {sesion.sesion}</strong>
                                      <span className={`badge ${sesion.tipo === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                                        {sesion.tipo}
                                      </span>
                                    </div>
                                    <div className="timeline-details">
                                      <span className="me-3">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {formatFecha(sesion.fecha)}
                                      </span>
                                      <span className="me-3">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatHora(sesion.inicio)} - {formatHora(sesion.termino)}
                                      </span>
                                      {sesion.relator && (
                                        <span>
                                          <i className="bi bi-person-circle me-1"></i>
                                          {sesion.relator}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {cronogramaFiltrado.length === 0 && (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-search display-4"></i>
                        <p className="mt-2">No hay sesiones que coincidan con los filtros</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de sesión (para la vista calendario) */}
      {sesionSeleccionada && (
        <div className="modal-backdrop-custom" onClick={() => setSesionSeleccionada(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Detalle de la sesión
              </h5>
              <button className="btn-close-custom" onClick={() => setSesionSeleccionada(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-card-body">
              <div className="mb-3">
                <span className={`badge ${sesionSeleccionada.tipo === 'presencial' ? 'bg-success' : 'bg-info'}`}>
                  {sesionSeleccionada.tipo}
                </span>
              </div>
              <h5>Módulo {sesionSeleccionada.modulo} - Sesión {sesionSeleccionada.sesion}</h5>
              <div className="sesion-detalle">
                <div><i className="bi bi-calendar3 me-2 text-primary"></i><strong>Fecha:</strong> {formatFecha(sesionSeleccionada.fecha)}</div>
                <div><i className="bi bi-clock me-2 text-primary"></i><strong>Hora:</strong> {formatHora(sesionSeleccionada.inicio)} - {formatHora(sesionSeleccionada.termino)}</div>
                {sesionSeleccionada.relator && (
                  <div><i className="bi bi-person-circle me-2 text-primary"></i><strong>Relator:</strong> {sesionSeleccionada.relator}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Cronograma;