import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    token: null,
    role: null,
    user: null,
    isLoading: false,
    error: null,
    otpPending: null, // { userId, maskedEmail, otp (dev only) }
  },
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    otpSent(state, action) {
      state.isLoading = false;
      state.otpPending = action.payload; // { userId, maskedEmail, otp? }
    },
    loginSuccess(state, action) {
      state.isLoading = false;
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.user = action.payload.user;
      state.otpPending = null;
    },
    loginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.role = null;
      state.user = null;
      state.error = null;
      state.otpPending = null;
    },
    forceLogout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.role = null;
      state.user = null;
      state.otpPending = null;
    },
    clearOTPPending(state) {
      state.otpPending = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart, otpSent, loginSuccess, loginFailure,
  logout, forceLogout, clearOTPPending, clearError,
} = authSlice.actions;
export default authSlice.reducer;
