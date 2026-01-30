import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { eventsApi } from '../api/endpoints';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { getCategoryLabel, EVENT_STATUS, ROUTES, USER_ROLE } from '../utils/constants';

/**
 * Backend event: title, description, category (populated), organizer (populated),
 * location { venue, address, city, coordinates }, startDate, endDate, totalSeats,
 * availableSeats, price, status, bannerImage
 */
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    eventsApi
      .getById(id)
      .then((res) => {
        if (res.data?.success && res.data?.event) setEvent(res.data.event);
        else setError('Event not found');
      })
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-app py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="page-heading text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-600">The event may have been removed or the link is invalid.</p>
        <Link to={ROUTES.EVENTS} className="mt-6 inline-block">
          <Button>Back to events</Button>
        </Link>
      </div>
    );
  }

  const categoryLabel = getCategoryLabel(event.category);
  const startDate = event.startDate
    ? new Date(event.startDate).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
    : '—';
  const endDate = event.endDate
    ? new Date(event.endDate).toLocaleString('en-IN', { timeStyle: 'short' })
    : '—';
  const organizerName = event.organizer?.name || (typeof event.organizer === 'object' ? event.organizer?.email : '—');
  const statusLabel = event.status ? EVENT_STATUS[event.status] || event.status : null;

  const isVerified = !!user?.isVerified;
  const canBook = isAuthenticated && isVerified;

  return (
    <div className="container-app py-10">
      <Card padding={false} className="overflow-hidden shadow-soft-lg">
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-56 sm:h-72 object-cover"
          />
        ) : (
          <div className="w-full h-56 sm:h-72 bg-gradient-hero flex items-center justify-center">
            <span className="text-6xl opacity-80">📅</span>
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
              {categoryLabel}
            </span>
            {statusLabel && (
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                  event.status === EVENT_STATUS.PUBLISHED
                    ? 'bg-emerald-50 text-emerald-700'
                    : event.status === EVENT_STATUS.DRAFT
                    ? 'bg-amber-50 text-amber-700'
                    : event.status === EVENT_STATUS.CANCELLED
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {event.status}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>📅 {startDate} – {endDate}</span>
            {event.location?.venue && <span>📍 {event.location.venue}</span>}
            {event.location?.address && <span>{event.location.address}</span>}
            {event.location?.city && <span>{event.location.city}</span>}
            {event.availableSeats != null && (
              <span>🪑 {event.availableSeats} seats available</span>
            )}
            {event.price != null && event.price > 0 && (
              <span>₹{event.price}</span>
            )}
          </div>
          {organizerName && (
            <p className="mt-2 text-sm text-slate-500">
              Organizer: <span className="font-medium text-slate-700">{organizerName}</span>
            </p>
          )}
          {event.description && (
            <div className="mt-6 text-slate-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" disabled={!canBook}>
                  {canBook ? 'Register / Book' : 'Verify email to book'}
                </Button>
                {!isVerified && (
                  <div className="text-sm text-amber-700">
                    You can browse events, but need to{' '}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={() => navigate(ROUTES.VERIFY_EMAIL)}
                    >
                      verify your email
                    </button>{' '}
                    before booking.
                  </div>
                )}
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  Login to book
                </Button>
              </>
            )}
            <Link to={ROUTES.EVENTS}>
              <Button variant="secondary" size="lg">Back to events</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
