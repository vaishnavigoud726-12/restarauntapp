import React, { useState } from 'react';
import { X, Star, CheckCircle, MessageSquareQuote } from 'lucide-react';
import API from '../../services/api';
import StarRating from '../common/StarRating';

export default function FeedbackModal({ isOpen, onClose, booking, onFeedbackSubmitted }) {
  const [ratings, setRatings] = useState({
    food: 5,
    service: 5,
    ambience: 5,
    overall: 5,
  });
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/feedback', {
        bookingId: booking._id,
        ratings,
        reviewTitle,
        comment,
      });

      if (res.success) {
        setSubmitted(true);
        if (onFeedbackSubmitted) onFeedbackSubmitted();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit verified review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquareQuote className="w-5 h-5 text-white" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Verified Dine-In Feedback</h3>
              <p className="text-white/80 text-[11px]">{booking.restaurantId?.name || 'Restaurant Visit'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <b>Verified Diner Review:</b> Only patrons with completed reservations can review.
                </span>
              </div>

              {/* 4 Factor Ratings */}
              <div className="space-y-2.5 pt-1">
                {[
                  { key: 'food', label: 'Food Quality & Taste' },
                  { key: 'service', label: 'Staff Hospitality & Service' },
                  { key: 'ambience', label: 'Ambience & Hygiene' },
                  { key: 'overall', label: 'Overall Experience' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <StarRating
                      rating={ratings[key]}
                      size="md"
                      interactive={true}
                      onRate={(val) => setRatings({ ...ratings, [key]: val })}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Delicious biryani and superb hospitality!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Detailed Feedback</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tell other diners about dish recommendations, seating comfort, wait times..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm shadow-brand-500/20 disabled:opacity-50"
              >
                {loading ? 'Submitting Review...' : 'Publish Verified Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">
                Review Published!
              </h4>
              <p className="text-xs text-slate-500">
                Your verified ratings help the dining community make informed choices.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

