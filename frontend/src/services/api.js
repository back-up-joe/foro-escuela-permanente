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

export const getComentarios = async () => {
  const response = await api.get('comentarios/');
  return response.data;
};

export const createComentario = async (data) => {

  console.log('Datos recibidos:', data);
  console.log('Archivo:', data.archivo);

  const formData = new FormData();
  formData.append('contenido', data.contenido);
  if (data.archivo) {
    formData.append('archivo', data.archivo);
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

export const responderComentario = async (id, contenido) => {
  const response = await api.post(`comentarios/${id}/responder/`, { contenido });
  return response.data;
};

export const likeRespuesta = async (id) => {
  const response = await api.post(`respuestas/${id}/like/`);
  return response.data;
};

export default api;