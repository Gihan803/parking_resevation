import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../shared/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend API for login
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('No token received from server');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-100 to-white">
      {/* Left Side - Visual */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-teal-100 to-teal-50 flex-col items-center justify-center px-6">
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="PickSlot Logo" 
          className="w-32 h-32 mb-8 object-contain"
        />
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center" />
          <div className="w-24 h-24 bg-teal-100 border-2 border-teal-300 rounded-lg flex items-center justify-center text-3xl">🚗</div>
          <div className="w-24 h-24 bg-red-100 border-2 border-red-400 rounded-lg flex items-center justify-center text-3xl">🚫</div>
          <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">
          Park peacefully.<br />
          <span className="text-teal-500">Arrive happily.</span>
        </h2>
        <p className="text-gray-600 text-center max-w-xs">
          Reserve your spot in advance and eliminate the stress of circling the block.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Find your spot without the stress.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-sm mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-semibold text-sm">Password</label>
                <a href="#" className="text-teal-500 text-sm font-semibold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-6 shadow-md disabled:bg-teal-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button className="w-full border border-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
            Google
          </button>

          <div className="text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-teal-500 font-semibold hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
