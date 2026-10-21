import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ REFRESH AUTOMÁTICO ROBUSTO ============

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(null, newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb(error, null));
  refreshSubscribers = [];
};

const logoutAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no es 401 o ya se reintentó, rechazar directo
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si es el propio endpoint de refresh, no reintentar
    if (originalRequest.url?.includes('/token/refresh/')) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, esperar
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((err, token) => {
          if (err || !token) {
            reject(err || new Error('Refresh failed'));
          } else {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          }
        });
      });
    }

    // Iniciar refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_URL}token/refresh/`,
        { refresh: refreshToken },
        { timeout: 10000 }   // ← timeout de 10s al refresh
      );
      const newToken = response.data.access;
      localStorage.setItem('access_token', newToken);
      onRefreshed(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      onRefreshFailed(refreshError);
      logoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;   // ← SIEMPRE se resetea
    }
  }
);

// ============ FIN REFRESH ============

export const login = async (username, password) => {
  const response = await api.post('login/', { username, password });
  return response.data;
};

// Actualizar getComentarios para aceptar nivel
export const getComentarios = async (nivel = null) => {
  const url = nivel ? `comentarios/?nivel=${nivel}` : 'comentarios/';
  const response = await api.get(url);
  return response.data;
};

// Actualizar createComentario para aceptar nivel
export const createComentario = async (data) => {
  const formData = new FormData();
  formData.append('contenido', data.contenido);
  if (data.archivo) {
    formData.append('archivo', data.archivo);
  }
  if (data.nivel) {
    formData.append('nivel', data.nivel);
  }
  const response = await api.post('comentarios/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,   // 60 segundos para subir PDFs grandes
  });
  return response.data;
};

export const likeComentario = async (id) => {
  const response = await api.post(`comentarios/${id}/like/`);
  return response.data;
};

// Actualizar responderComentario para aceptar nivel
export const responderComentario = async (id, contenido, nivel = null) => {
  const data = { contenido };
  if (nivel) data.nivel = nivel;
  const response = await api.post(`comentarios/${id}/responder/`, data);
  return response.data;
};

export const likeRespuesta = async (id) => {
  const response = await api.post(`respuestas/${id}/like/`);
  return response.data;
};

export default api;

//////////////////////////////////// Informes
export const getInformes = async (nivel = null) => {
  const url = nivel ? `informes/?nivel=${nivel}` : 'informes/';
  const response = await api.get(url);
  return response.data;
};

export const createInforme = async (data) => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('descripcion', data.descripcion || '');
  formData.append('archivo', data.archivo);

  if (data.nivel) {
    formData.append('nivel', data.nivel);
  }
  
  const response = await api.post('informes/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

////////////////////////////////////// Enlaces
export const getEnlaces = async () => {
  const response = await api.get('enlaces/');
  return response.data;
};

/////////////////////////////////////// Cronograma
export const getCronograma = async () => {
  const response = await api.get('cronograma/');
  return response.data;
};

/////////////////////////////////////// ChatBot
// Chat
export const sendChatMessage = async (data) => {
  const response = await api.post('chat/mensajes/send/', data);
  return response.data;
};

export const getChatSessions = async () => {
  const response = await api.get('chat/sesiones/');
  return response.data;
};

export const createChatSession = async () => {
  const response = await api.post('chat/sesiones/');
  return response.data;
};

//////////////////////////////////// Material de Estudio
export const getMateriales = async (nivel = null, modulo = null, sesion = null) => {
  const params = new URLSearchParams();
  if (nivel) params.append('nivel', nivel);
  if (modulo) params.append('modulo', modulo);
  if (sesion) params.append('sesion', sesion);
  const query = params.toString();
  const response = await api.get(`material-estudio/${query ? '?' + query : ''}`);
  return response.data;
};

export const createMaterial = async (data) => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('descripcion', data.descripcion || '');
  formData.append('archivo', data.archivo);
  if (data.nivel) formData.append('nivel', data.nivel);
  if (data.modulo) formData.append('modulo', data.modulo);
  if (data.sesion) formData.append('sesion', data.sesion);
  if (data.orden !== undefined) formData.append('orden', data.orden);
  
  const response = await api.post('material-estudio/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFiltrosMateriales = async (nivel = null) => {
  const url = nivel ? `material-estudio/filtros/?nivel=${nivel}` : 'material-estudio/filtros/';
  const response = await api.get(url);
  return response.data;
};