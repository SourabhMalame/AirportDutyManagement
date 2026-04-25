import axiosInstance from './axiosInstance';

export const sendOtpApi = credentials => {
  console.log("send otp")
  return axiosInstance.post('/auth/send-otp', credentials);
};

export const verifyOtpApi = payload => {
  return axiosInstance.post('/auth/verify-otp', payload);
};

export const resendOtpApi = userId =>
  axiosInstance.post('/auth/resend-otp', { userId });

export const logoutApi = () =>
  axiosInstance.post('/auth/logout');
