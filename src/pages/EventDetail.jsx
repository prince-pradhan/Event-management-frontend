import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { eventsApi } from '../api/endpoints'; // Ensure endpoints index exports eventsApi
import { authApi } from '../api/endpoints/auth'; // Ensure this exists if needed, or use apiClient directly
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input'; // Assuming Input component exists
import { getCategoryLabel, EVENT_STATUS, ROUTES } from '../utils/constants';

/**
 * Backend event: title, description, category (populated), organizer (populated),
 * location { venue, address, city, coordinates }, startDate, endDate, totalSeats,
 * availableSeats, price, status, bannerImage, registrationFields
 */
export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration state
  const [registering, setRegistering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [regData, setRegData] = useState({});
  const [regError, setRegError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    // Fetch event details
    eventsApi.getById(id)
      .then((res) => {
        if (res.data?.success && res.data?.event) {
          setEvent(res.data.event);
        } else {
          setError('Event not found');
        }
      })
      .catch(() => setError('Event not found'))
      .finally(() => setLoading(false));

    // Check if user is already registered
    if (isAuthenticated) {
      apiClient.get('/registrations/mine')
        .then(res => {
          if (res.data.success) {
            const registered = res.data.registrations.some(r => r.event._id === id || r.event === id);
            setIsRegistered(registered);
          }
        })
        .catch(err => console.error('Failed to check registration', err));
    }
  }, [id, isAuthenticated]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: `/events/${id}` } });
      return;
    }

    // If event has custom fields, show modal
    if (event.registrationFields && event.registrationFields.length > 0) {
      // Initialize regData
      const initialData = {};
      event.registrationFields.forEach(field => {
        initialData[field.name] = field.fieldType === 'checkbox' ? false : '';
      });
      setRegData(initialData);
      setShowModal(true);
    } else {
      // No fields, just register
      submitRegistration({});
    }
  };

  const submitRegistration = async (additionalInfo) => {
    setRegistering(true);
    setRegError('');
    try {
      const payload = {
        eventId: id,
        additionalInfo
      };

      const res = await apiClient.post('/registrations', payload);
      if (res.data.success) {
        setIsRegistered(true);
        setShowModal(false);
        alert('You have successfully registered for this event!');
        // Update available seats locally for UI feedback
        setEvent(prev => ({
          ...prev,
          availableSeats: prev.availableSeats > 0 ? prev.availableSeats - 1 : 0
        }));
      }
    } catch (err) {
      console.error(err);
      setRegError(err.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    submitRegistration(regData);
  };

  const handleInputChange = (e, field) => {
    const value = field.fieldType === 'checkbox' ? e.target.checked : e.target.value;
    setRegData(prev => ({ ...prev, [field.name]: value }));
  };

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

  // Registration Logic checks
  const now = new Date();
  const isPublished = event.status === EVENT_STATUS.PUBLISHED;
  const isRegistrationOpen =
    isPublished &&
    (!event.registrationStartDate || now >= new Date(event.registrationStartDate)) &&
    (!event.registrationEndDate || now <= new Date(event.registrationEndDate));

  const hasSeats = event.availableSeats == null || event.availableSeats > 0;

  return (
    <div className="container-app py-10 relative">
      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Registration Details</h2>
            <p className="text-sm text-slate-600 mb-6">Please provide the following information to complete your registration.</p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {event.registrationFields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.fieldType === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={!!regData[field.name]}
                      onChange={(e) => handleInputChange(e, field)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  ) : (
                    <input
                      type={field.fieldType === 'number' ? 'number' : 'text'}
                      step={field.fieldType === 'number' ? 'any' : undefined}
                      required={field.required}
                      value={regData[field.name]}
                      onChange={(e) => handleInputChange(e, field)}
                      className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
                    />
                  )}
                </div>
              ))}

              {regError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{regError}</div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={registering}>
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

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
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${event.status === EVENT_STATUS.PUBLISHED
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
            {event.price === 0 && (
              <span className="text-emerald-600 font-medium">Free</span>
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
            {isRegistered ? (
              <Button disabled className="bg-emerald-100 text-emerald-800 cursor-default">
                ✓ Registered
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleRegisterClick}
                disabled={!isRegistrationOpen || !hasSeats}
                className={!isRegistrationOpen || !hasSeats ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {!isPublished
                  ? 'Not Published'
                  : !isRegistrationOpen
                    ? 'Registration Closed'
                    : !hasSeats
                      ? 'Full'
                      : 'Register Now'}
              </Button>
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
