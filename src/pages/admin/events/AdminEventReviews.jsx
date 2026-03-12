import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewApi, eventsApi } from '../../../api/endpoints';
import { ROUTES } from '../../../utils/constants';
import Card from '../../../components/common/Card';
import ReviewList from '../../../components/reviews/ReviewList';
import { useAuth } from '../../../context/AuthContext';

export default function AdminEventReviews() {
  const { id } = useParams();
  const { isSystemAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper to resolve admin path based on role
  const getAdminPath = (path) => {
    const prefix = isSystemAdmin ? '/admin' : '/institution-admin';
    return path.replace('/admin', prefix);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewRes, eventRes] = await Promise.all([
          reviewApi.getReviewsByEvent(id),
          eventsApi.getById(id)
        ]);

        if (reviewRes.data.success) {
          setReviews(reviewRes.data.reviews);
        }
        if (eventRes.data.success) {
          setEvent(eventRes.data.event);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setError('Failed to load reviews for this event.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <Link to={getAdminPath(ROUTES.ADMIN_EVENTS)} className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-block uppercase tracking-wider">
            ← Back to events
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Reviews for <span className="text-primary-600">{event?.title || 'Event'}</span>
          </h1>
          <p className="mt-1 text-slate-500 font-medium">Monitor student feedback and ratings</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100/50 p-8">
          <ReviewList reviews={reviews} />
        </section>
      )}
    </div>
  );
}
