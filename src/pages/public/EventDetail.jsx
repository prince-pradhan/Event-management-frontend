import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { eventsApi, reviewApi } from '../../api/endpoints';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import PayPalPayment from '../../components/common/PayPalPayment';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import { getCategoryLabel, EVENT_STATUS, ROUTES } from '../../utils/constants';

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
    const [registration, setRegistration] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Review state
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        // Fetch event details
        eventsApi.getById(id)
            .then((res) => {
                if (res.data?.success && res.data?.event) {
                    const eventData = res.data.event;
                    // Check if event is draft
                    if (eventData.status === EVENT_STATUS.DRAFT) {
                        setError('This event is currently in draft and not available to the public.');
                        setEvent(null);
                    } else {
                        setEvent(eventData);
                    }
                } else {
                    setError('Event not found');
                }
            })
            .catch(() => setError('Event not found'))
            .finally(() => setLoading(false));

        // Fetch reviews
        reviewApi.getReviewsByEvent(id)
            .then(res => {
                if (res.data.success) {
                    setReviews(res.data.reviews);
                }
            })
            .catch(err => console.error('Failed to fetch reviews', err));

        // Check if user is already registered and has reviewed
        if (isAuthenticated) {
            apiClient.get('/registrations/mine')
                .then(res => {
                    if (res.data.success) {
                        const userReg = res.data.registrations.find(r => (r.event._id === id || r.event === id) && r.status !== 'CANCELLED');
                        if (userReg) {
                            setIsRegistered(userReg.status === 'REGISTERED');
                            setRegistration(userReg);
                        }
                    }
                })
                .catch(err => console.error('Failed to check registration', err));

            reviewApi.getMyReviews()
                .then(res => {
                    if (res.data.success) {
                        const review = res.data.reviews.find(r => r.event._id === id || r.event === id);
                        setUserReview(review);
                    }
                })
                .catch(err => console.error('Failed to fetch user review', err));
        }
    }, [id, isAuthenticated]);

    const handleRegisterClick = () => {
        if (!isAuthenticated) {
            navigate(ROUTES.LOGIN, { state: { from: `/events/${id}` } });
            return;
        }

        const confirmMsg = event.isFree 
            ? `Are you sure you want to register for ${event.title}? It's a free event.`
            : `Are you sure you want to register for ${event.title}? This is a paid event (${event.price || '0'}). You will need to complete payment after this step.`;

        if (!window.confirm(confirmMsg)) {
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
                setRegistration(res.data.registration);
                
                if (res.data.registration.status === 'REGISTERED') {
                    setIsRegistered(true);
                    setShowModal(false);
                    setShowSuccessModal(true);
                    // Update available seats locally
                    setEvent(prev => ({
                        ...prev,
                        availableSeats: prev.availableSeats > 0 ? prev.availableSeats - 1 : 0
                    }));
                } else if (res.data.registration.status === 'PENDING') {
                    setShowModal(false);
                    setShowPaymentModal(true);
                }
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

    const handleReviewSubmit = async (reviewData) => {
        if (userReview) {
            // Update existing review
            const res = await reviewApi.updateReview(userReview._id, reviewData);
            if (res.data.success) {
                setUserReview(res.data.review);
                setReviews(reviews.map(r => r._id === userReview._id ? res.data.review : r));
                setShowReviewForm(false);
            }
        } else {
            // Create new review
            const res = await reviewApi.createReview(reviewData);
            if (res.data.success) {
                setUserReview(res.data.review);
                setReviews([res.data.review, ...reviews]);
                setShowReviewForm(false);
            }
        }
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

    // Format the event date range. If the event spans a single day, show the date once and
    // the start/end times. If it spans multiple days, render the full datetime on each side.
    const formatEventDateRange = (startISO, endISO) => {
        if (!startISO) return '—';
        const start = new Date(startISO);
        const end = endISO ? new Date(endISO) : null;
        const dateOpts = { dateStyle: 'long' };
        const timeOpts = { timeStyle: 'short' };
        const fullOpts = { dateStyle: 'long', timeStyle: 'short' };

        if (!end) {
            return start.toLocaleString('en-IN', fullOpts);
        }
        const sameDay =
            start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate();

        if (sameDay) {
            return `${start.toLocaleDateString('en-IN', dateOpts)}, ${start.toLocaleTimeString('en-IN', timeOpts)} – ${end.toLocaleTimeString('en-IN', timeOpts)}`;
        }
        return `${start.toLocaleString('en-IN', fullOpts)} – ${end.toLocaleString('en-IN', fullOpts)}`;
    };
    const eventDateLabel = formatEventDateRange(event.startDate, event.endDate);
    const organizerName = event.organizer?.name || (typeof event.organizer === 'object' ? event.organizer?.email : '—');
    const statusLabel = event.status ? EVENT_STATUS[event.status] || event.status : null;

    // Logic checks
    const now = new Date();
    const isPublished = event.status === EVENT_STATUS.PUBLISHED;
    const regStart = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
    const regEnd = event.registrationEndDate ? new Date(event.registrationEndDate) : null;
    const registrationNotYetOpen = !!regStart && now < regStart;
    const isRegistrationOpen =
        isPublished &&
        (!regStart || now >= regStart) &&
        (!regEnd || now <= regEnd);
    const hasSeats = event.availableSeats == null || event.availableSeats > 0;
    const canReview = isRegistered && new Date(event.endDate) < now && !userReview;
    const regStartLabel = regStart
        ? regStart.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
        : null;

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

            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Complete Payment"
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        This is a paid event. Please complete the payment of <strong>${event.price}</strong> via PayPal to confirm your registration.
                    </p>
                    <PayPalPayment 
                        registrationId={registration?._id}
                        onApprove={(updatedRegistration) => {
                            setRegistration(updatedRegistration);
                            setIsRegistered(true);
                            setShowPaymentModal(false);
                            setShowSuccessModal(true);
                            // Update available seats locally
                            setEvent(prev => ({
                                ...prev,
                                availableSeats: prev.availableSeats > 0 ? prev.availableSeats - 1 : 0
                            }));
                        }}
                        onError={(msg) => setRegError(msg)}
                    />
                    {regError && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{regError}</div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate(ROUTES.STUDENT_MY_REGISTRATIONS);
                }}
                title="Registration Successful!"
            >
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-slate-600 text-lg">
                        You have successfully registered for <strong>{event.title}</strong>!
                    </p>
                    <p className="text-slate-500 text-sm">
                        You can view your registration details and ticket in your dashboard.
                    </p>
                    <Button 
                        className="w-full mt-4"
                        onClick={() => {
                            setShowSuccessModal(false);
                            navigate(ROUTES.STUDENT_MY_REGISTRATIONS);
                        }}
                    >
                        Go to My Registrations
                    </Button>
                </div>
            </Modal>

            <Card padding={false} className="overflow-hidden shadow-soft-lg">
                {event.bannerImage ? (
                    <img
                        src={typeof event.bannerImage === 'object' ? (event.bannerImage.url || '') : event.bannerImage}
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
                        <span>📅 {eventDateLabel}</span>
                        {event.location?.venue && <span>📍 {event.location.venue}</span>}
                        {event.location?.address && <span>{event.location.address}</span>}
                        {event.location?.city && <span>{event.location.city}</span>}
                        {event.availableSeats != null && (
                            <span>🪑 {event.availableSeats} seats available</span>
                        )}
                        {event.price != null && event.price > 0 && (
                            <span className="text-primary-600 font-bold">
                                ${event.price}
                            </span>
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

                    {isPublished && registrationNotYetOpen && !isRegistered && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                            <span>⏳</span>
                            <span>Registration starts on <strong>{regStartLabel}</strong></span>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-4 items-center">
                        {isRegistered ? (
                            <Button disabled className="bg-emerald-100 text-emerald-800 cursor-default border-emerald-200">
                                ✓ Registered
                            </Button>
                        ) : registration?.status === 'PENDING' ? (
                            <Button
                                size="lg"
                                onClick={() => setShowPaymentModal(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                            >
                                💳 Complete Payment
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
                                    : registrationNotYetOpen
                                        ? 'Registration Not Yet Open'
                                        : !isRegistrationOpen
                                            ? 'Registration Closed'
                                            : !hasSeats
                                                ? 'Full'
                                                : event.isFree
                                                    ? 'Register Now'
                                                    : `Register & Pay ($${event.price})`}
                            </Button>
                        )}

                        <Link to={ROUTES.EVENTS}>
                            <Button variant="secondary" size="lg">Back to events</Button>
                        </Link>
                    </div>
                </div>
            </Card>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews</h2>
                {isAuthenticated && isRegistered && new Date(event.endDate) < now && (
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-slate-100">
                        {userReview && !showReviewForm ? (
                            <div>
                                <h3 className="text-lg font-semibold">Your Review</h3>
                                <ReviewList reviews={[userReview]} />
                                <Button onClick={() => setShowReviewForm(true)} className="mt-4">Edit Your Review</Button>
                            </div>
                        ) : (
                            <ReviewForm
                                eventId={id}
                                onSubmit={handleReviewSubmit}
                                onCancel={userReview ? () => setShowReviewForm(false) : null}
                                existingReview={userReview}
                            />
                        )}
                    </div>
                )}
                <ReviewList reviews={reviews.filter(r => r.user._id !== user?._id)} />
            </div>
        </div>
    );
}
