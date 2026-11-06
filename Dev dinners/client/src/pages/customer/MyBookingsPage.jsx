import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Tag, CheckCircle2, AlertCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import API from '../../services/api';
import FeedbackModal from '../../components/customer/FeedbackModal';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await API.put(`/bookings/${id}/cancel`);
      if (res.success) {
        alert('Reservation cancelled.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-500" />
          My Table Reservations
        </h1>
        <p className="text-xs text-slate-500">
          Track upcoming dine-in arrivals, access check-in verification codes, and post verified feedback.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading your reservations...
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-700">No reservations placed yet.</p>
          <p>Explore restaurants near you and reserve a table in seconds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCompleted = booking.status === 'completed';
            const isConfirmed = booking.status === 'confirmed';
            const isSeated = booking.status === 'seated';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={booking.restaurantId?.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200'}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-slate-900">
                        {booking.restaurantId?.name || 'Restaurant'}
                      </h4>
                      {/* Status Pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isSeated
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : isConfirmed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        ● {booking.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-500" />
                      {booking.restaurantId?.address?.area}, Hyderabad
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {booking.bookingDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {booking.timeSlot}
                      </span>
                      <span>Party: <b>{booking.guestCount} Guests</b></span>
                      <span>Table: <b>{booking.tableId?.tableNumber}</b></span>
                    </div>
                  </div>
                </div>

                {/* Right Action / Secret Code Box */}
                <div className="w-full md:w-auto flex flex-col md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Arrival Code if active */}
                  {(isConfirmed || isSeated) && (
                    <div className="bg-brand-50/70 border border-brand-200/80 px-3 py-1.5 rounded-xl text-center md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Host Check-In Code
                      </span>
                      <span className="text-xl font-extrabold text-brand-600 font-mono tracking-widest">
                        {booking.checkInCode}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 w-full md:w-auto">
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      >
                        Cancel Slot
                      </button>
                    )}

                    {isCompleted && !booking.isFeedbackSubmitted && (
                      <button
                        onClick={() => setSelectedBookingForFeedback(booking)}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5" />
                        Submit Verified Review
                      </button>
                    )}

                    {isCompleted && booking.isFeedbackSubmitted && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Review Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verified Feedback Modal */}
      <FeedbackModal
        isOpen={!!selectedBookingForFeedback}
        onClose={() => setSelectedBookingForFeedback(null)}
        booking={selectedBookingForFeedback}
        onFeedbackSubmitted={fetchBookings}
      />
    </div>
  );
}

