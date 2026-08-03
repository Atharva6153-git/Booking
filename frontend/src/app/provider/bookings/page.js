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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Incoming Bookings</h1>

        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold">{b.service?.title}</h2>
                <p className="text-sm text-gray-500">Customer: {b.customer?.name}</p>
                <p className="text-sm text-gray-500">{b.date} • {b.startTime}-{b.endTime}</p>
                <p className={`text-sm font-medium mt-1 ${statusColor[b.status]}`}>Status: {b.status}</p>
                <p className="text-sm text-gray-500">Payment: {b.paymentStatus}</p>
                <p className="font-bold mt-1">₹{b.finalPrice}</p>

                <div className="flex gap-2 mt-3">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(b._id, 'confirmed')} disabled={updatingId === b._id} className="bg-green-600 text-white rounded px-3 py-1 text-sm">Accept</button>
                      <button onClick={() => handleStatusUpdate(b._id, 'cancelled')} disabled={updatingId === b._id} className="bg-red-500 text-white rounded px-3 py-1 text-sm">Reject</button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => handleStatusUpdate(b._id, 'completed')} disabled={updatingId === b._id} className="bg-blue-600 text-white rounded px-3 py-1 text-sm">Mark Completed</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}