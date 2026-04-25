import axios from 'axios';

import {store} from '../store';

import {forceLogout} from '../store/slices/authSlice';
// import {API_BASE_URL} from '@env';

// const API_BASE_URL = 'http://localhost:5000/api/v1';
// const API_BASE_URL = 'http://192.168.29.89:5000/api/v1';

const API_BASE_URL = 'https://tj8kr1sk-5000.inc1.devtunnels.ms/api/v1'; // sourabh 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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











