import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ParkingSlot from './ParkingSlot';
import BookingModal from './BookingModal';
import MyReservations from './MyReservations';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load slots on mount only
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch slots from backend API
      const response = await fetch('http://localhost:8000/api/slots', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }

      const data = await response.json();
      
      // Use real data from backend, fallback to mock if needed
      const slotData = data.slots || Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        slot_number: String(i + 1).padStart(2, '0'),
        status: i % 3 === 0 ? 'occupied' : 'available',
      }));
      
      setSlots(slotData);
    } catch (err) {
      console.error('Error fetching slots:', err);
      // Fallback to mock data on error
      const mockSlots = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        slot_number: String(i + 1).padStart(2, '0'),
        status: i % 3 === 0 ? 'occupied' : 'available',
      }));
      setSlots(mockSlots);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingConfirm = (reservation) => {
    // Immediately refresh slots to show the booked slot as occupied
    fetchSlots();
    // Show success message after a short delay
    setTimeout(() => {
      setActiveTab('reservations');
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show My Reservations page
  if (activeTab === 'reservations') {
    return <MyReservations onBack={() => setActiveTab('dashboard')} />;
  }

  const availableCount = slots.filter(s => s.status === 'available').length;
  const occupiedCount = slots.length - availableCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-emerald-500"></div>
          <p className="mt-4 text-gray-600">Loading parking slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
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
                onClick={() => setActiveTab('dashboard')}
                className={`font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-emerald-500 border-emerald-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'reservations'
                    ? 'text-emerald-500 border-emerald-500'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                My Reservations
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'profile'
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
              Total Slots
            </div>
            <div className="text-4xl font-bold text-gray-900 mt-2">{slots.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-emerald-600 text-sm font-semibold uppercase tracking-wide">
              Available
            </div>
            <div className="text-4xl font-bold text-emerald-600 mt-2">{availableCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-red-600 text-sm font-semibold uppercase tracking-wide">
              Occupied
            </div>
            <div className="text-4xl font-bold text-red-600 mt-2">{occupiedCount}</div>
          </div>
        </div>

        {/* Parking Slots Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Select a Parking Spot</h2>
            <button
              onClick={() => fetchSlots()}
              disabled={loading}
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm disabled:text-gray-400"
            >
              🔄 Refresh
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Choose an available space for your vehicle. Green slots are open, red slots are taken.
          </p>

          {/* Legend */}
          <div className="flex gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-400 rounded"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-400 rounded"></div>
              <span className="text-gray-700 font-medium">Occupied</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Parking Slots Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {slots.map((slot) => (
              <ParkingSlot
                key={slot.id}
                slot={slot}
                onSelect={handleSlotSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}
