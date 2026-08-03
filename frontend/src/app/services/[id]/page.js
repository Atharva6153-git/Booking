'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchService();
    fetchAvailability();
    fetchReviews();
  }, [id]);

  const fetchService = async () => {
    try {
      const res = await api.get(`/services/${id}`);
      setService(res.data.service);
    } catch (err) {
      console.error('Failed to fetch service:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (date) => {
    try {
      const params = date ? { date } : {};
      const res = await api.get(`/availability/service/${id}`, { params });
      setAvailability(res.data.availability);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/service/${id}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleDateFilter = (e) => {
    setSelectedDate(e.target.value);
    fetchAvailability(e.target.value);
  };

  const handleBookSlot = async (availabilityId, slotId) => {
    setBooking(true);
    setMessage('');
    try {
      await api.post('/bookings', { availabilityId, slotId });
      router.push('/bookings');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
      setBooking(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!service) return <p className="p-6">Service not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-6">
        <button onClick={() => router.push('/services')} className="text-blue-600 mb-4">&larr; Back to services</button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <p className="text-gray-500">{service.category} • {service.area}</p>
          <p className="text-gray-500">by {service.provider?.name}</p>
          <p className="mt-2">{service.description}</p>
          <p className="mt-2 font-bold text-lg">₹{service.price}</p>
          <p className="text-sm text-yellow-600">★ {service.avgRating?.toFixed(1) || 'New'}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold mb-3">Available Slots</h2>
          <input type="date" value={selectedDate} onChange={handleDateFilter} className="border rounded p-2 mb-4" />
          {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}
          {availability.length === 0 ? (
            <p className="text-gray-500">No slots available.</p>
          ) : (
            availability.map((av) => (
              <div key={av._id} className="mb-4">
                <p className="font-medium">{av.date}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {av.slots.map((slot) => (
                    <button key={slot._id} disabled={slot.isBooked || booking} onClick={() => handleBookSlot(av._id, slot._id)} className={`px-3 py-1 rounded border text-sm ${slot.isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="border-b pb-3">
                  <p className="text-sm font-medium">{r.customer?.name} — ★ {r.rating}</p>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}