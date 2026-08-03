'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/provider');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-10">Incoming Bookings</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500">No incoming bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="border border-gray-100 rounded-2xl p-6 md:p-8 hover:border-black transition-colors bg-white shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-widest ${statusColor[b.status] || 'text-gray-500'} bg-gray-50 border border-gray-100`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-medium text-gray-400">{b.date} • {b.startTime}-{b.endTime}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-black mb-2">{b.service?.title}</h2>
                  <p className="text-sm text-gray-500 font-medium mb-1">Customer: <span className="text-black">{b.customer?.name}</span></p>
                  <p className="text-sm text-gray-500 font-medium">Payment: <span className="capitalize text-black">{b.paymentStatus}</span></p>
                </div>

                <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                  <p className="text-2xl font-bold text-black mb-4">₹{b.finalPrice}</p>

                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(b._id, 'confirmed')} 
                          disabled={updatingId === b._id} 
                          className="bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(b._id, 'cancelled')} 
                          disabled={updatingId === b._id} 
                          className="bg-white border border-gray-200 text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(b._id, 'completed')} 
                        disabled={updatingId === b._id} 
                        className="bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}