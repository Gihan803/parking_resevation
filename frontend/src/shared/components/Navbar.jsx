import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Shared navbar used by customer pages.
export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-teal-600' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-teal-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="font-bold text-xl" onClick={closeMenu}>
              Parking Reservation
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/admin')}`}
              >
                Admin
              </Link>
            )}
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/my-reservations"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/my-reservations')}`}
            >
              My Reservations
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/profile')}`}
            >
              Profile
            </Link>
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.full_name || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-teal-600 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                // Close icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-2">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/admin')}`}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-reservations"
                onClick={closeMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/my-reservations')}`}
              >
                My Reservations
              </Link>
              <Link
                to="/profile"
                onClick={closeMenu}
                className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 transition-colors ${isActive('/profile')}`}
              >
                Profile
              </Link>
            </div>

            {/* Mobile User Info & Logout */}
            <div className="mt-4 pt-4 border-t border-teal-400">
              <div className="flex flex-col space-y-3">
                <span className="text-sm px-3">
                  Welcome, {user?.full_name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mx-3"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
