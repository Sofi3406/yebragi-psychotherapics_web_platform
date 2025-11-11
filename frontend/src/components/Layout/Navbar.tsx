import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Calendar, MessageSquare, BookOpen, Home, Users, Clock } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Yebragi</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/appointments"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </Link>
              {user.role === 'PATIENT' && (
                <Link
                  to="/therapists"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
                >
                  <Users className="w-5 h-5" />
                  <span>Find Therapists</span>
                </Link>
              )}
              {user.role === 'THERAPIST' && (
                <Link
                  to="/availability"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
                >
                  <Clock className="w-5 h-5" />
                  <span>Availability</span>
                </Link>
              )}
              <Link
                to="/articles"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <BookOpen className="w-5 h-5" />
                <span>Articles</span>
              </Link>
              <Link
                to="/chat"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Chat</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition"
              >
                <User className="w-5 h-5" />
                <span>{user.fullName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {!user && (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};



