import React, { useState } from 'react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add registration logic
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-500 to-white">
      {/* Left Side - Visual */}
      <div className="hidden md:flex w-1/2 bg-teal-500 text-white flex-col items-center justify-center px-6">
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="PickSlot Logo" 
          className="w-32 h-32 mb-8 object-contain"
        />
        
        <h2 className="text-4xl font-bold text-center mb-4">
          Join our community.<br />
          Park with peace of mind.
        </h2>
        <p className="text-teal-100 text-center max-w-md mb-12">
          Access thousands of verified accessible parking spots and contribute to a more inclusive world.
        </p>
        <div className="text-6xl opacity-70">🗺️</div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-600 mb-8">Start your journey toward stress-free parking today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-sm mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
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

            <div>
              <label className="block font-semibold text-sm mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
                className="mt-1"
              />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-teal-500 font-semibold hover:underline">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-teal-500 font-semibold hover:underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition mt-6 shadow-md"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-teal-500 font-semibold hover:underline">
              Log In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
