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
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-10">Manage Availability</h1>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 text-black text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-gray-100 rounded-2xl p-6 md:p-8 mb-12 bg-white shadow-sm">
          <div className="mb-8">
            <label className="block text-sm font-semibold text-black mb-2">Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full md:w-1/2 border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all cursor-pointer" 
              required 
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-black">Time Slots</label>
              <button type="button" onClick={addSlotRow} className="text-sm font-medium text-black hover:underline">+ Add Slot</button>
            </div>
            
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input 
                    type="time" 
                    value={slot.startTime} 
                    onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)} 
                    className="flex-1 border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all cursor-pointer" 
                    required 
                  />
                  <span className="text-gray-400">to</span>
                  <input 
                    type="time" 
                    value={slot.endTime} 
                    onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)} 
                    className="flex-1 border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all cursor-pointer" 
                    required 
                  />
                  {slots.length > 1 && (
                    <button type="button" onClick={() => removeSlotRow(index)} className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-lg border border-gray-100 hover:bg-red-50 hover:border-red-100">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white rounded-lg px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
            Save Availability
          </button>
        </form>

        <h2 className="text-2xl font-bold tracking-tight text-black mb-6">Existing Availability</h2>
        
        {availability.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500">No availability set yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {availability.map((av) => (
              <div key={av._id} className="border border-gray-100 rounded-2xl p-6 hover:border-black transition-colors bg-white shadow-sm">
                <p className="text-lg font-bold text-black mb-4">{av.date}</p>
                <div className="flex gap-3 flex-wrap">
                  {av.slots.map((slot) => (
                    <div key={slot._id} className={`flex items-center gap-3 px-4 py-2 rounded-lg border text-sm font-medium ${slot.isBooked ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-white border-gray-200 text-black'}`}>
                      <span>{slot.startTime} - {slot.endTime}</span>
                      {!slot.isBooked && (
                        <button onClick={() => handleRemoveSlot(av._id, slot._id)} className="text-gray-400 hover:text-red-500 transition-colors">
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