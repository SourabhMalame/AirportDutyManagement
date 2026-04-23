import axios from 'axios';
import {store} from '../store';
import {forceLogout} from '../store/slices/authSlice';
import {API_BASE_URL} from '@env';

const BASE_URL = API_BASE_URL || 'http://10.0.2.2:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {'Content-Type': 'application/json'},
});

axiosInstance.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const isAuthRequest = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthRequest) {
      store.dispatch(forceLogout());
    }
    return Promise.reject(error.response?.data || error);
  },
);

export default axiosInstance;
