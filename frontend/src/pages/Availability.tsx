import { useEffect, useState } from 'react';
import { therapistService, AvailabilitySlot } from '../services/therapistService';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Availability = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.role === 'THERAPIST') {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      // Get therapist profile ID from user profile
      const profile = await userService.getProfile();
      
      if (profile.therapistProfile?.id) {
        const data = await therapistService.getAvailability(profile.therapistProfile.id);
        setSlots(data.slots);
      } else {
        toast.error('Therapist profile not found');
      }
    } catch (error) {
      toast.error('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    if (!startTime || !endTime) {
      toast.error('Please select both start and end times');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    if (new Date(startTime) < new Date()) {
      toast.error('Cannot create slots in the past');
      return;
    }

    setCreating(true);
    try {
      await therapistService.createAvailability({ startTime, endTime });
      toast.success('Availability slot created successfully');
      setShowModal(false);
      setStartTime('');
      setEndTime('');
      fetchAvailability();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create slot');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      await therapistService.deleteAvailability(slotId);
      toast.success('Slot deleted successfully');
      fetchAvailability();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    }
  };

  if (user?.role !== 'THERAPIST') {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">This page is only available for therapists.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const upcomingSlots = slots.filter((slot) => new Date(slot.startTime) >= new Date());
  const pastSlots = slots.filter((slot) => new Date(slot.startTime) < new Date());

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
            <p className="mt-2 text-gray-600">Set your available time slots for patients to book</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Slot</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Slots</h2>
              {upcomingSlots.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming availability slots. Create one to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-500"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(new Date(slot.startTime), 'h:mm a')} -{' '}
                              {format(new Date(slot.endTime), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        {!slot.isBooked && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      {slot.isBooked ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Booked
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Available
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pastSlots.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Slots</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-gray-50 rounded-xl shadow-md p-6 border-l-4 border-gray-300"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(slot.startTime), 'h:mm a')} -{' '}
                          {format(new Date(slot.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Slot Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Add Availability Slot</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setStartTime('');
                    setEndTime('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setStartTime('');
                      setEndTime('');
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSlot}
                    disabled={creating}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Slot'}
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

