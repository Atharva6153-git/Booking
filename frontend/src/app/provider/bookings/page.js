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

  const statusColor = {
    pending: 'text-yellow-600',
    confirmed: 'text-green-600',
    completed: 'text-blue-600',
    cancelled: 'text-red-600',
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-4 sm:p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-8 sm:mb-10">Incoming Bookings</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500">No incoming bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="border border-gray-100 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-black transition-colors bg-white shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* Status + date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-widest ${statusColor[b.status] || 'text-gray-500'} bg-gray-50 border border-gray-100`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-medium text-gray-400">{b.date} · {b.startTime}-{b.endTime}</span>
                  </div>

                  {/* Title + info + price */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-black mb-1 truncate">{b.service?.title}</h2>
                      <p className="text-sm text-gray-500 font-medium mb-0.5">Customer: <span className="text-black">{b.customer?.name}</span></p>
                      <p className="text-sm text-gray-500 font-medium">Payment: <span className="capitalize text-black">{b.paymentStatus}</span></p>
                    </div>
                    <p className="text-2xl font-bold text-black shrink-0">₹{b.finalPrice}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(b._id, 'confirmed')}
                          disabled={updatingId === b._id}
                          className="flex-1 sm:flex-none bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors active:scale-[0.97]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b._id, 'cancelled')}
                          disabled={updatingId === b._id}
                          className="flex-1 sm:flex-none bg-white border border-gray-200 text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors active:scale-[0.97]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(b._id, 'completed')}
                        disabled={updatingId === b._id}
                        className="flex-1 sm:flex-none bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors active:scale-[0.97]"
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