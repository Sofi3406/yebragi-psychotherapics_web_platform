import { useEffect, useState } from 'react';
import { therapistService, Therapist } from '../services/therapistService';
import { appointmentService } from '../services/appointmentService';
import { Search, Calendar, User, Clock, CheckCircle, X } from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Therapists = () => {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const data = await therapistService.list({ search });
      setTherapists(data.therapists);
    } catch (error) {
      toast.error('Failed to fetch therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchTherapists();
  };

  const handleBookAppointment = async () => {
    if (!selectedTherapist || !selectedSlot) {
      toast.error('Please select a therapist and time slot');
      return;
    }

    setBooking(true);
    try {
      await appointmentService.create({
        therapistId: selectedTherapist.id,
        slotId: selectedSlot,
      });
      toast.success('Appointment booked successfully!');
      setSelectedTherapist(null);
      setSelectedSlot(null);
      fetchTherapists(); // Refresh to update availability
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (user?.role !== 'PATIENT') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">This page is only available for patients.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find a Therapist</h1>
          <p className="mt-2 text-gray-600">Search and book appointments with licensed therapists</p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or specialization..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : therapists.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Therapists Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedTherapist(therapist)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  {therapist.availability && therapist.availability.length > 0 && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {therapist.availability.length} slots available
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{therapist.user.fullName}</h3>
                {therapist.bio && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{therapist.bio}</p>}
                {therapist.specializations && therapist.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {therapist.specializations.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {spec.specialization.name}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTherapist(therapist);
                  }}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  View Availability
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedTherapist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <button
                  onClick={() => {
                    setSelectedTherapist(null);
                    setSelectedSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTherapist.user.fullName}</h3>
                  {selectedTherapist.bio && <p className="text-gray-600">{selectedTherapist.bio}</p>}
                </div>

                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Available Time Slots</h4>
                  {selectedTherapist.availability && selectedTherapist.availability.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTherapist.availability.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`p-4 border-2 rounded-lg text-left transition ${
                            selectedSlot === slot.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(slot.startTime), 'h:mm a')} -{' '}
                                {format(new Date(slot.endTime), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No available slots at the moment.</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedTherapist(null);
                      setSelectedSlot(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || booking}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};




