import axiosInstance from './axiosInstance';

export const getDutyReport = filters =>
  axiosInstance.get('/reports/duties', {params: filters});

export const getSubordinateReport = filters =>
  axiosInstance.get('/reports/subordinates', {params: filters});
