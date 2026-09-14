import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getStoredUser, getAuthToken, setStoredUser, clearStoredUser } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [authModalConfig, setAuthModalConfig] = useState({
    isOpen: false,
    redirectUrl: null,
    message: null,
    onSuccessCallback: null
  });

  const isPro = Boolean(user?.isPro || user?.role === 'admin');

  // Synchronize live profile from server to guarantee VIP status is always up-to-date
  const refreshProfile = useCallback(async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) return null;
      const res = await axios.get('/api/v1/user/profile');
      if (res.data?.data) {
        const profile = res.data.data;
        const current = getStoredUser() || {};
        const updated = setStoredUser({ ...current, ...profile });
        setUser(updated);
        return updated;
      }
    } catch (e) {
      console.warn('refreshProfile error:', e);
    }
    return null;
  }, []);

  const checkIsLoggedIn = () => {
    const currentUser = getStoredUser();
    const currentToken = getAuthToken();
    return Boolean(currentUser && (currentToken || currentUser.email || currentUser.id || currentUser.userId));
  };

  const isLoggedIn = checkIsLoggedIn();

  // Sync state when route changes or auth event fires
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
      setToken(getAuthToken());
    };

    handleAuthChange();
    refreshProfile();

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_state_changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_state_changed', handleAuthChange);
    };
  }, [location.pathname, refreshProfile]);

  const login = (userData, jwtToken) => {
    const saved = setStoredUser(userData, jwtToken);
    setUser(saved);
    setToken(jwtToken);
    window.dispatchEvent(new Event('auth_state_changed'));
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event('auth_state_changed'));
  };

  const openAuthModal = (redirectUrl = null, message = null, onSuccessCallback = null) => {
    setAuthModalConfig({
      isOpen: true,
      redirectUrl,
      message,
      onSuccessCallback
    });
  };

  const closeAuthModal = () => {
    setAuthModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  /**
   * Guards an action or navigation behind authentication.
   * If logged in -> executes callback or navigates to targetUrl.
   * If not logged in -> triggers the AuthModal and remembers the intended destination.
   */
  const requireAuth = (targetOrCallback, customMessage = null) => {
    if (checkIsLoggedIn()) {
      if (typeof targetOrCallback === 'function') {
        targetOrCallback();
      } else if (typeof targetOrCallback === 'string') {
        navigate(targetOrCallback);
      }
      return true;
    }

    if (typeof targetOrCallback === 'string') {
      openAuthModal(targetOrCallback, customMessage);
    } else if (typeof targetOrCallback === 'function') {
      openAuthModal(null, customMessage, targetOrCallback);
    } else {
      openAuthModal(null, customMessage);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isPro,
        refreshProfile,
        login,
        logout,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
        requireAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
