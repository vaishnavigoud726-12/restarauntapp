import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Tag, CheckCircle2, AlertCircle, ArrowRight, Ticket } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TIME_SLOTS = [
  '12:00 - 14:00',
  '14:00 - 16:00',
  '19:00 - 21:00',
  '20:00 - 22:00',
  '21:00 - 23:00',
];

export default function BookingModal({ isOpen, onClose, restaurant, prefilledMeal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('19:00 - 21:00');
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [discountCode, setDiscountCode] = useState(prefilledMeal?.discountCode || '');
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [waitlistPrompt, setWaitlistPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !restaurant) return null;

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in or create an account to reserve a table.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setWaitlistPrompt(false);

    try {
      const res = await API.post('/bookings', {
        restaurantId: restaurant._id,
        guestCount,
        bookingDate,
        timeSlot,
        specialRequests,
        discountCode: discountCode.trim() || null,
        billEstimatedAmount: prefilledMeal?.estimatedAmount || restaurant.priceForTwo,
      });

      if (res.success) {
        setBookingConfirmed(res.data);
      }
    } catch (err) {
      if (err.message.includes('waitlist') || err.message.includes('fully booked')) {
        setWaitlistPrompt(true);
      }
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setLoading(true);
    try {
      const res = await API.post('/waitlist/join', {
        restaurantId: restaurant._id,
        guestCount,
        date: bookingDate,
        timeSlot,
      });
      if (res.success) {
        alert(`Success! You have joined the waitlist at queue position #${res.data.queuePosition}. We will notify you when a table is ready.`);
        onClose();
        navigate('/my-bookings');
      }
    } catch (err) {
      alert(err.message || 'Failed to join waitlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Reserve Table – {restaurant.name}</h3>
              <p className="text-white/80 text-[11px]">{restaurant.address?.area}, Hyderabad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!bookingConfirmed ? (
            <form onSubmit={handleCreateReservation} className="space-y-4">
              {/* Guest Count */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Party Size (Number of Diners)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        guestCount === num
                          ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dining Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Personalized Discount Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME20 or LOYALTY25"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="w-full text-xs px-3 py-2 uppercase rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Special Requests / Occasion
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Window booth seat, birthday celebration, high chair needed..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              {/* Error or Waitlist Notice */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{errorMsg}</p>
                    {waitlistPrompt && (
                      <button
                        type="button"
                        onClick={handleJoinWaitlist}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        Join Waitlist for this Slot
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <span>{loading ? 'Confirming Availability...' : 'Confirm Table Booking'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Confirmation Success Card */
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-slate-900">
                  Reservation Confirmed!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your table is guaranteed at {restaurant.name}.
                </p>
              </div>

              {/* Secret 4-Digit Check-In Code */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                  Arrival Check-In Code
                </span>
                <div className="text-3xl font-extrabold tracking-widest text-brand-600 font-mono">
                  {bookingConfirmed.booking?.checkInCode}
                </div>
                <p className="text-[11px] text-slate-500">
                  Provide this 4-digit verification code to the host upon arrival.
                </p>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 flex justify-between">
                  <span>Assigned Table: <b>{bookingConfirmed.tableNumber} ({bookingConfirmed.zone})</b></span>
                  <span>Ref: <b>{bookingConfirmed.booking?.bookingReference}</b></span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
                >
                  View in My Reservations
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

