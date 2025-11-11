import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, Appointment, AppointmentStats } from '../services/appointmentService';
import { format } from 'date-fns';
import { Calendar, Clock, User, Video, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import toast from 'react-hot-toast';

export const Appointments = () => {
  const { user } = useAuth();
  const isTherapist = user?.role === 'THERAPIST';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.list();
      setAppointments(data.appointments);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentService.delete(id);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await appointmentService.accept(id);
      toast.success('Appointment accepted successfully');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept appointment');
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await appointmentService.decline(id);
      toast.success('Appointment declined successfully');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to decline appointment');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await appointmentService.complete(id);
      toast.success('Appointment marked as completed');
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isTherapist ? 'Appointment Requests' : 'My Appointments'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isTherapist
              ? 'Review and manage appointment requests from your patients.'
              : 'Manage your therapy appointments'}
          </p>
          {stats && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.confirmed}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500">{isTherapist ? 'Pending Approvals' : 'Pending'}</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments</h3>
            <p className="text-gray-600">You don't have any appointments yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isTherapist
                            ? appointment.patient?.fullName ?? 'Unknown patient'
                            : appointment.therapist.user.fullName}
                        </h3>
                        {isTherapist ? (
                          <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                        ) : (
                          appointment.therapist.bio && (
                            <p className="text-sm text-gray-600">{appointment.therapist.bio}</p>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span>{format(new Date(appointment.slot.startTime), 'MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span>
                          {format(new Date(appointment.slot.startTime), 'h:mm a')} -{' '}
                          {format(new Date(appointment.slot.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {appointment.payment && (
                        <span className="text-sm text-gray-600">
                          Payment: ${appointment.payment.amount} ({appointment.payment.status})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.meetLink && appointment.status === 'CONFIRMED' && (
                      <a
                        href={appointment.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                      >
                        <Video className="w-5 h-5" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                    {!isTherapist && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    )}
                    {isTherapist && appointment.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(appointment.id)}
                          className="flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDecline(appointment.id)}
                          className="flex items-center space-x-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                        >
                          <XCircle className="w-5 h-5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}
                    {isTherapist && appointment.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleComplete(appointment.id)}
                        className="flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};



