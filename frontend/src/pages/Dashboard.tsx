import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, Appointment, AppointmentStats } from '../services/appointmentService';
import { MainLayout } from '../components/Layout/MainLayout';
import PatientDashboard from './PatientDashboard';
import TherapistDashboard from './TherapistDashboard';

export const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.list();
        setAppointments(data.appointments.slice(0, 5)); // Show latest 5
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch appointments');
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const navigate = useNavigate();

  // If therapist hit /dashboard, redirect to explicit therapist route for clarity
  useEffect(() => {
    // Normalize role so we handle 'Therapist', 'therapist', etc.
    if ((user?.role || '').toString().toUpperCase() === 'THERAPIST') {
      navigate('/therapist/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  if (!user) {
    return null; // or a loading state handled by ProtectedRoute
  }

  const isTherapist = (user?.role || '').toString().toUpperCase() === 'THERAPIST';

  return (
    <MainLayout>
      {isTherapist ? (
        <TherapistDashboard appointments={appointments} stats={stats} />
      ) : (
        <PatientDashboard appointments={appointments} stats={stats} />
      )}
    </MainLayout>
  );
};



