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

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white w-full p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-black mb-10">My Bookings</h1>

        {message && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 text-black text-sm font-medium rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400 font-medium animate-pulse">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-gray-500">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <div key={b._id} className="border border-gray-100 rounded-2xl p-6 md:p-8 hover:border-black transition-colors bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded uppercase tracking-widest ${statusColor[b.status] || 'text-gray-500'} bg-gray-50 border border-gray-100`}>
                        {b.status}
                      </span>
                      <span className="text-sm font-medium text-gray-400">{b.date} • {b.startTime}-{b.endTime}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-black mb-2">{b.service?.title}</h2>
                    <p className="text-sm text-gray-500 font-medium mb-1">Provider: <span className="text-black">{b.provider?.name}</span></p>
                    <p className="text-sm text-gray-500 font-medium">Payment: <span className="capitalize text-black">{b.paymentStatus}</span></p>
                  </div>
                  
                  <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                    <p className="text-2xl font-bold text-black mb-4">₹{b.finalPrice}</p>
                    
                    <div className="flex gap-2">
                      {b.paymentStatus !== 'paid' && (
                        <button 
                          onClick={() => handlePayNow(b)} 
                          disabled={payingId === b._id} 
                          className="bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {payingId === b._id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                      
                      {b.status === 'completed' && (
                        <button 
                          onClick={() => setReviewFormId(reviewFormId === b._id ? null : b._id)} 
                          className="bg-white border border-gray-200 text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {reviewFormId === b._id ? 'Cancel' : 'Review'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {reviewFormId === b._id && (
                  <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-semibold text-black mb-4">Leave a Review</h3>
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Rating (1-5)</label>
                      <input 
                        type="number" 
                        min="1" max="5" 
                        value={reviewData.rating} 
                        onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })} 
                        className="w-24 border border-gray-200 rounded-lg p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all mb-4" 
                      />
                      
                      <label className="block text-sm font-medium text-gray-500 mb-2">Comment</label>
                      <textarea 
                        placeholder="Share your experience..." 
                        value={reviewData.comment} 
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} 
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all mb-4 h-24 resize-none" 
                      />
                      
                      <button 
                        onClick={() => handleSubmitReview(b._id)} 
                        className="bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
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