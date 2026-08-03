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
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.push('/services')} className="text-sm font-medium text-gray-500 hover:text-black transition-colors mb-8 flex items-center gap-2">
          &larr; Back to services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded uppercase tracking-widest border border-gray-100">
                  {service.category}
                </span>
                <span className="text-sm font-medium text-yellow-600 flex items-center gap-1">★ {service.avgRating?.toFixed(1) || 'New'}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4 leading-tight">{service.title}</h1>
              
              <div className="flex items-center gap-3 text-gray-500 text-sm md:text-base font-medium mb-8">
                <span>By <span className="text-black">{service.provider?.name}</span></span>
                <span className="text-gray-300">•</span>
                <span>{service.area}</span>
              </div>

              <div className="prose max-w-none text-gray-600 leading-relaxed text-lg">
                <p>{service.description}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <h2 className="text-2xl font-bold tracking-tight mb-8">Customer Reviews</h2>
              {reviews.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  No reviews yet for this service.
                </div>
              ) : (
                <div className="space-y-8">
                  {reviews.map((r) => (
                    <div key={r._id} className="pb-8 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-black">{r.customer?.name}</span>
                        <span className="text-yellow-600 text-sm font-medium">★ {r.rating}</span>
                      </div>
                      {r.comment && <p className="text-gray-600 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Service Price</p>
                <p className="text-4xl font-bold text-black tracking-tight">₹{service.price}</p>
              </div>

              <h3 className="font-semibold text-black mb-4">Select Date</h3>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={handleDateFilter} 
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all mb-6 cursor-pointer" 
              />
              
              {message && <p className="mb-4 text-sm font-medium text-black bg-gray-50 p-3 rounded-lg border border-gray-100">{message}</p>}
              
              <h3 className="font-semibold text-black mb-4">Available Times</h3>
              {availability.length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 text-center">No slots available for selected date.</p>
              ) : (
                <div className="space-y-6">
                  {availability.map((av) => (
                    <div key={av._id}>
                      {!selectedDate && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{av.date}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        {av.slots.map((slot) => (
                          <button 
                            key={slot._id} 
                            disabled={slot.isBooked || booking} 
                            onClick={() => handleBookSlot(av._id, slot._id)} 
                            className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                              slot.isBooked 
                                ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white border-black text-black hover:bg-black hover:text-white'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}