import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple auth gate based on presence of a token.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
