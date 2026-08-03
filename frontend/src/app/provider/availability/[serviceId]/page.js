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

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Manage Availability</h1>

      {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium mb-1">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded p-2 mb-4" required />

        <label className="block text-sm font-medium mb-1">Time Slots</label>
        {slots.map((slot, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input type="time" value={slot.startTime} onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)} className="border rounded p-2 flex-1" required />
            <input type="time" value={slot.endTime} onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)} className="border rounded p-2 flex-1" required />
            {slots.length > 1 && (
              <button type="button" onClick={() => removeSlotRow(index)} className="text-red-500 px-2">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSlotRow} className="text-blue-600 text-sm mb-4">+ Add another slot</button>

        <button type="submit" className="w-full bg-green-600 text-white rounded p-2">Save Availability</button>
      </form>

      <h2 className="font-semibold mb-3">Existing Availability</h2>
      {availability.length === 0 ? (
        <p className="text-gray-500">No availability set yet.</p>
      ) : (
        availability.map((av) => (
          <div key={av._id} className="bg-white rounded-lg shadow p-4 mb-3">
            <p className="font-medium">{av.date}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              {av.slots.map((slot) => (
                <span key={slot._id} className={`px-3 py-1 rounded border text-sm flex items-center gap-2 ${slot.isBooked ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
                  {slot.startTime}-{slot.endTime}
                  {!slot.isBooked && (
                    <button onClick={() => handleRemoveSlot(av._id, slot._id)} className="text-red-500">✕</button>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}