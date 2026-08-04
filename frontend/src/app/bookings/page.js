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
    cancelled: 'text-red-500',
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white dark:bg-neutral-950 w-full p-4 sm:p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white mb-8 sm:mb-10">My Bookings</h1>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-black dark:text-white text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-neutral-700 rounded-lg bg-gray-50/50 dark:bg-neutral-900/50">
            <p className="text-gray-500 dark:text-gray-400">You haven&apos;t made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="border border-gray-100 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 hover:border-black dark:hover:border-neutral-600 transition-colors bg-white dark:bg-neutral-900 shadow-sm">
                <div className="flex flex-col gap-4">
                  {/* Status + date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-widest ${statusColor[b.status] || 'text-gray-500'} bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{b.date} · {b.startTime}-{b.endTime}</span>
                  </div>

                  {/* Title + info + price */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-1 truncate">{b.service?.title}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Provider: <span className="text-black dark:text-white">{b.provider?.name}</span></p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Payment: <span className="capitalize text-black dark:text-white">{b.paymentStatus}</span></p>
                    </div>
                    <p className="text-2xl font-bold text-black dark:text-white shrink-0">₹{b.finalPrice}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {b.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => handlePayNow(b)}
                        disabled={payingId === b._id}
                        className="flex-1 sm:flex-none bg-black dark:bg-white text-white dark:text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors active:scale-[0.97]"
                      >
                        {payingId === b._id ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button
                        onClick={() => setReviewFormId(reviewFormId === b._id ? null : b._id)}
                        className="flex-1 sm:flex-none bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-black dark:text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors active:scale-[0.97]"
                      >
                        {reviewFormId === b._id ? 'Cancel' : 'Review'}
                      </button>
                    )}
                  </div>
                </div>

                {reviewFormId === b._id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800">
                    <h3 className="font-semibold text-black dark:text-white mb-4">Leave a Review</h3>
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Rating (1–5)</label>
                        <input
                          type="number"
                          min="1" max="5"
                          value={reviewData.rating}
                          onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
                          className="w-24 border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Comment</label>
                        <textarea
                          placeholder="Share your experience..."
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                          className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white outline-none transition-all h-24 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitReview(b._id)}
                        className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
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
