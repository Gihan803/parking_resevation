import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserData } from '../utils/helpers';
import { authApi } from '../utils/api';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('auth_token');
  const cachedUser = getUserData();

  const [state, setState] = useState(() => {
    if (!token) return { status: 'no_token' };
    if (cachedUser?.role === 'admin') return { status: 'ok' };
    if (cachedUser) return { status: 'forbidden' };
    return { status: 'loading' };
  });

  useEffect(() => {
    if (state.status !== 'loading') return;

    let mounted = true;
    authApi
      .me()
      .then((user) => {
        if (!mounted) return;
        localStorage.setItem('user', JSON.stringify(user));
        setState({ status: user?.role === 'admin' ? 'ok' : 'forbidden' });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ status: 'no_token' });
      });

    return () => {
      mounted = false;
    };
  }, [state.status]);

  if (!token || state.status === 'no_token') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (state.status === 'forbidden') {
    return <Navigate to="/dashboard" replace />;
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Checking admin access...</div>
      </div>
    );
  }

  return children;
}

