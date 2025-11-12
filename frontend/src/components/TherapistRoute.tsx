import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const TherapistRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  // case-insensitive check for therapist role
  if ((user.role || '').toString().toUpperCase() !== 'THERAPIST') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

export default TherapistRoute;
