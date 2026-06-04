import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuth, ready } = useAuth();
  if (!ready) return <div className="loading-page"><div className="spinner"/></div>;
  return isAuth ? children : <Navigate to="/login" replace />;
}