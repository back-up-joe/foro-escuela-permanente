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