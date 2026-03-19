import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Friendly Parking</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/dashboard')}
              className={`font-semibold pb-2 border-b-2 transition-colors ${
                isActive('/dashboard')
                  ? 'text-emerald-500 border-emerald-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/my-reservations')}
              className={`font-semibold pb-2 border-b-2 transition-colors ${
                isActive('/my-reservations')
                  ? 'text-emerald-500 border-emerald-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              My Reservations
            </button>
            <button
              className={`font-semibold pb-2 border-b-2 transition-colors ${
                isActive('/profile')
                  ? 'text-emerald-500 border-emerald-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {user?.full_name || 'Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 font-semibold hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className={`text-sm font-semibold ${
                isActive('/dashboard') ? 'text-emerald-500' : 'text-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/my-reservations')}
              className={`text-sm font-semibold ${
                isActive('/my-reservations') ? 'text-emerald-500' : 'text-gray-600'
              }`}
            >
              Reservations
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
