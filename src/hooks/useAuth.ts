import {useDispatch, useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';
import {
  loginStart, otpSent, loginSuccess, loginFailure,
  logout, clearOTPPending, clearError,
} from '../store/slices/authSlice';
import {sendOtpApi, verifyOtpApi, resendOtpApi, logoutApi} from '../api/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth);

  // Step 1: validate credentials and send OTP
  const sendOTP = async credentials => {
    dispatch(loginStart());
    try {
      const res = await sendOtpApi(credentials);
      dispatch(otpSent({
        userId: res.data.userId,
        maskedEmail: res.data.maskedEmail,
        otp: res.data.otp, // only present in dev
      }));
      Toast.show({type: 'success', text1: 'OTP Sent', text2: res.data.message});
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed.';
      dispatch(loginFailure(msg));
      Toast.show({type: 'error', text1: 'Login Failed', text2: msg});
      return false;
    }
  };

  // Step 2: verify OTP and complete login
  const verifyOTP = async (userId, otp) => {
    dispatch(loginStart());
    try {
      const res = await verifyOtpApi({userId, otp});
      dispatch(loginSuccess(res.data));
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'OTP verification failed.';
      dispatch(loginFailure(msg));
      Toast.show({type: 'error', text1: 'Verification Failed', text2: msg});
      return false;
    }
  };

  const resendOTP = async userId => {
    try {
      const res = await resendOtpApi(userId);
      if (res.data.otp) {
        dispatch(otpSent({...authState.otpPending, otp: res.data.otp}));
      }
      Toast.show({type: 'success', text1: 'OTP Resent', text2: res.data.message});
      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend OTP.';
      Toast.show({type: 'error', text1: 'Error', text2: msg});
      return null;
    }
  };

  const signOut = async () => {
    try {
      await logoutApi();
    } catch {}
    dispatch(logout());
  };

  return {
    ...authState,
    sendOTP,
    verifyOTP,
    resendOTP,
    signOut,
    clearOTPPending: () => dispatch(clearOTPPending()),
    clearError: () => dispatch(clearError()),
  };
};
