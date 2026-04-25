import axiosInstance from './axiosInstance';

export const getAirports = () => axiosInstance.get('/airports');
export const createAirport = data => axiosInstance.post('/airports', data);
export const updateAirport = (id, data) => axiosInstance.patch(`/airports/${id}`, data);
export const toggleAirport = (id, isActive) => axiosInstance.patch(`/airports/${id}/toggle`, {isActive});

export const getTerminals = airportId => axiosInstance.get(`/airports/${airportId}/terminals`);
export const createTerminal = (airportId, data) => axiosInstance.post(`/airports/${airportId}/terminals`, data);
export const updateTerminal = (airportId, terminalId, data) => axiosInstance.patch(`/airports/${airportId}/terminals/${terminalId}`, data);
export const toggleTerminal = (airportId, terminalId, isActive) => axiosInstance.patch(`/airports/${airportId}/terminals/${terminalId}/toggle`, {isActive});
