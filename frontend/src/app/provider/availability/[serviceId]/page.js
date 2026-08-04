'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';

export default function ManageAvailabilityPage() {
  const { serviceId } = useParams();
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([{ startTime: '', endTime: '' }]);
  const [availability, setAvailability] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get(`/availability/service/${serviceId}`);
      setAvailability(res.data.availability);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const handleSlotChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const addSlotRow = () => setSlots([...slots, { startTime: '', endTime: '' }]);
  const removeSlotRow = (index) => setSlots(slots.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/availability', { serviceId, date, slots });
      setMessage('Availability created!');
      setDate('');
      setSlots([{ startTime: '', endTime: '' }]);
      fetchAvailability();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create availability');
    }
  };

  const handleRemoveSlot = async (availabilityId, slotId) => {
    try {
      await api.delete(`/availability/${availabilityId}/slot/${slotId}`);
      fetchAvailability();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove slot');
    }
  };

  const timeCls = "flex-1 border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all cursor-pointer";

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950 w-full p-4 sm:p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white mb-8 sm:mb-10">Manage Availability</h1>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 md:p-8 mb-12 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-1/2 border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all cursor-pointer"
              required
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-black dark:text-white">Time Slots</label>
              <button type="button" onClick={addSlotRow} className="text-sm font-medium text-black dark:text-white hover:underline">
                + Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                    className={timeCls}
                    required
                  />
                  <span className="text-gray-400 dark:text-gray-500 shrink-0 text-sm">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                    className={timeCls}
                    required
                  />
                  {slots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlotRow(index)}
                      className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-100 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-100 dark:hover:border-red-900 shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black rounded-lg px-8 py-3 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            Save Availability
          </button>
        </form>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white mb-6">Existing Availability</h2>

        {availability.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50/50 dark:bg-neutral-900/50">
            <p className="text-gray-500 dark:text-gray-400">No availability set yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {availability.map((av) => (
              <div key={av._id} className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 hover:border-black dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-900 shadow-sm">
                <p className="text-lg font-bold text-black dark:text-white mb-4">{av.date}</p>
                <div className="flex gap-3 flex-wrap">
                  {av.slots.map((slot) => (
                    <div
                      key={slot._id}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm font-medium ${
                        slot.isBooked
                          ? 'bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 text-gray-400'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-black dark:text-white'
                      }`}
                    >
                      <span>{slot.startTime} - {slot.endTime}</span>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleRemoveSlot(av._id, slot._id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
