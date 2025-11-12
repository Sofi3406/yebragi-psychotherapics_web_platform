import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RoleRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if ((user.role || '').toString().toUpperCase() === 'THERAPIST') {
      navigate('/therapist/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return null;
};

export default RoleRedirect;
