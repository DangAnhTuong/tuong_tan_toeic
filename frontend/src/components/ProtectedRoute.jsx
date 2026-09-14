import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, getStoredUser } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  const token = getAuthToken();
  const user = getStoredUser();
  const location = useLocation();

  const isAuthed = Boolean(user && (token || user.email || user.id || user.userId));

  if (!isAuthed) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return children;
}
