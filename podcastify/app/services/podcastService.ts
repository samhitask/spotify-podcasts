import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Attempt to refresh the token
          await axios.get(`${API_URL}/token`, { withCredentials: true });
          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
);

export const login = () => {
  window.location.href = `${API_URL}/login`;
};

export const getToken = async () => {
  try {
    const response = await api.get('/token');
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

export const getPodcasts = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    throw error;
  }
};

export const getShows = async () => {
  try {
    const response = await api.get('/shows');
    return response.data;
  } catch (error) {
    console.error('Error fetching shows:', error);
    throw error;
  }
};

export const configureBackend = async (config: any) => {
  try {
    const response = await api.post('/config', config);
    return response.data;
  } catch (error) {
    console.error('Error configuring backend:', error);
    throw error;
  }
};
