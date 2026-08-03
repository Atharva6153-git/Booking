'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [reviewFormId, setReviewFormId] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
    const socket = getSocket();
    socket.on('bookingStatusUpdate', () => fetchBookings());
    return () => socket.off('bookingStatusUpdate');
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (booking) => {
    setPayingId(booking._id);
    try {
      const orderRes = await api.post('/payments/create-order', { bookingId: booking._id });
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'ServiceHub',
        description: booking.service?.title || 'Service Booking',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            fetchBookings();
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start payment');
    } finally {
      setPayingId(null);
    }
  };

  const handleSubmitReview = async (bookingId) => {
    setMessage('');
    try {
      await api.post('/reviews', { bookingId, rating: Number(reviewData.rating), comment: reviewData.comment });
      setMessage('Review submitted!');
      setReviewFormId(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit review');
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
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

        {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">{b.service?.title}</h2>
                    <p className="text-sm text-gray-500">Provider: {b.provider?.name}</p>
                    <p className="text-sm text-gray-500">{b.date} • {b.startTime}-{b.endTime}</p>
                    <p className={`text-sm font-medium mt-1 ${statusColor[b.status]}`}>Status: {b.status}</p>
                    <p className="text-sm text-gray-500">Payment: {b.paymentStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{b.finalPrice}</p>
                    {b.paymentStatus !== 'paid' && (
                      <button onClick={() => handlePayNow(b)} disabled={payingId === b._id} className="mt-2 bg-green-600 text-white rounded px-3 py-1 text-sm">
                        {payingId === b._id ? 'Loading...' : 'Pay Now'}
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button onClick={() => setReviewFormId(reviewFormId === b._id ? null : b._id)} className="mt-2 bg-yellow-500 text-white rounded px-3 py-1 text-sm block">
                        {reviewFormId === b._id ? 'Cancel' : 'Leave Review'}
                      </button>
                    )}
                  </div>
                </div>

                {reviewFormId === b._id && (
                  <div className="mt-4 border-t pt-4">
                    <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" value={reviewData.rating} onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })} className="border rounded p-2 w-20 mb-2" />
                    <textarea placeholder="Write a comment (optional)" value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} className="w-full border rounded p-2 mb-2" />
                    <button onClick={() => handleSubmitReview(b._id)} className="bg-blue-600 text-white rounded px-4 py-2 text-sm">Submit Review</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}