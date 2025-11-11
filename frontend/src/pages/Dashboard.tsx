import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, Appointment, AppointmentStats } from '../services/appointmentService';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { MainLayout } from '../components/Layout/MainLayout';

export const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.list();
        setAppointments(data.appointments.slice(0, 5)); // Show latest 5
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const isTherapist = user?.role === 'THERAPIST';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isTherapist ? 'Therapist Dashboard' : `Welcome back, ${user?.fullName}!`}
          </h1>
          <p className="mt-2 text-gray-600">
            {isTherapist ? 'Manage your upcoming sessions and track patient appointments' : "Here's what's happening with your appointments"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.total ?? 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.confirmed ?? 0}
                </p>
              </div>
              <Clock className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{isTherapist ? 'Pending Approvals' : 'Pending'}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.pending ?? 0}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{isTherapist ? 'Upcoming Sessions' : 'Recent Appointments'}</h2>
            <div className="flex items-center space-x-3">
              <Link
                to="/appointments"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <span>View All</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isTherapist && (
                <Link
                  to="/appointments"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Book Appointment</span>
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{isTherapist ? 'No upcoming sessions yet' : 'No appointments yet'}</p>
              {!isTherapist && (
                <Link
                  to="/appointments"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Book Appointment</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {isTherapist
                            ? appointment.patient?.fullName ?? 'Unknown patient'
                            : appointment.therapist.user.fullName}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 ml-8">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(appointment.slot.startTime), 'MMM dd, yyyy')} at{' '}
                            {format(new Date(appointment.slot.startTime), 'h:mm a')}
                          </span>
                        </span>
                      </div>
                    </div>
                    {appointment.meetLink && (
                      <a
                        href={appointment.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isTherapist && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Availability</h3>
            <p className="text-gray-600 mb-4">
              Update your availability slots and respond to pending appointment requests from patients.
            </p>
            <Link
              to="/appointments"
              className="inline-flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Review Appointment Requests</span>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};



