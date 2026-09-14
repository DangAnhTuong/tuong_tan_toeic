import axios from 'axios';

// 1. Token & User Storage Keys
const TOKEN_KEY = 'tuong_tan_toeic_jwt_token';
const USER_KEY = 'tuong_tan_toeic_user';

// 2. Global Axios Interceptor to Attach JWT Token to All Requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
  if (token) return token;
  const user = getStoredUser();
  if (user?.token) return user.token;
  if (user?.jwtToken) return user.jwtToken;
  return null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('token', token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const parsed = JSON.parse(userStr);
      if (parsed && (parsed.email || parsed.id || parsed.userId || parsed._id || parsed.fullName)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading stored user:', err);
  }
  return null;
};

export const setStoredUser = (userObj, token = null) => {
  try {
    const extractedToken = token || userObj?.token || userObj?.jwtToken;
    if (extractedToken) {
      setAuthToken(extractedToken);
    }
    const current = getStoredUser();
    const updated = { ...current, ...userObj, isLoggedIn: true };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    return updated;
  } catch (err) {
    console.warn('Error saving user:', err);
  }
};

export const clearStoredUser = () => {
  clearAuthToken();
  localStorage.removeItem(USER_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth_state_changed'));
  }
};

// 3. API Auth Methods
export const apiLogin = async (email, password) => {
  const res = await axios.post('/api/v1/auth/login', { email, password });
  if (res.data?.token) {
    setStoredUser(res.data.data, res.data.token);
  }
  return res.data;
};

export const apiSendRegistrationOtp = async (email, password, fullName) => {
  const res = await axios.post('/api/v1/auth/send-registration-otp', { email, password, fullName });
  return res.data;
};

export const apiVerifyRegistrationOtp = async (email, otp) => {
  const res = await axios.post('/api/v1/auth/verify-registration-otp', { email, otp });
  if (res.data?.token) {
    setStoredUser(res.data.data, res.data.token);
  }
  return res.data;
};

export const apiRegister = async (email, password, fullName, otp = null) => {
  if (otp) {
    return apiVerifyRegistrationOtp(email, otp);
  }
  return apiSendRegistrationOtp(email, password, fullName);
};

export const apiGoogleAuth = async (googlePayload) => {
  const res = await axios.post('/api/v1/auth/google', googlePayload);
  if (res.data?.token) {
    setStoredUser(res.data.data, res.data.token);
  }
  return res.data;
};

