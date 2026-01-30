import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants';

/**
 * Backend Booking model: user (ref User), event (ref Event), seats[], totalAmount,
 * bookingStatus (PENDING|CONFIRMED|CANCELLED|FAILED), paymentStatus (UNPAID|PAID|REFUNDED)
 * Static data mirrors this shape until booking API is ready.
 */
const STATIC_BOOKINGS = [
  {
    _id: '1',
    event: { _id: 'e1', title: 'Tech Workshop: Intro to Web Dev', startDate: '2025-01-15T10:00:00', location: { venue: 'Main Hall' } },
    totalAmount: 0,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    createdAt: '2025-01-10T12:00:00',
  },
  {
    _id: '2',
    event: { _id: 'e2', title: 'Career Seminar: Industry Insights', startDate: '2024-12-20T14:00:00', location: { venue: 'Room 101' } },
    totalAmount: 0,
    bookingStatus: BOOKING_STATUS.CONFIRMED,
    paymentStatus: PAYMENT_STATUS.PAID,
    createdAt: '2024-12-15T09:00:00',
  },
  {
    _id: '3',
    event: { _id: 'e3', title: 'Cultural Fest – Dance Competition', startDate: '2025-02-10T16:00:00', location: { venue: 'Auditorium' } },
    totalAmount: 50,
    bookingStatus: BOOKING_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    createdAt: '2025-01-20T11:00:00',
  },
];

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export default function MyBookings() {
  return (
    <div className="container-app py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading text-slate-900">My bookings</h1>
          <p className="mt-1 text-slate-600">Your registered events and tickets (Booking model)</p>
        </div>
        <Link to={ROUTES.EVENTS} className="inline-block">
          <Button>Browse events</Button>
        </Link>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft">
        <div className="divide-y divide-slate-100">
          {STATIC_BOOKINGS.map((booking) => (
            <div
              key={booking._id}
              className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{booking.event?.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {formatDate(booking.event?.startDate)} · {booking.event?.location?.venue}
                </p>
                {booking.totalAmount != null && booking.totalAmount > 0 && (
                  <p className="text-sm text-slate-600 mt-1">Amount: ₹{booking.totalAmount}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    booking.bookingStatus === BOOKING_STATUS.CONFIRMED
                      ? 'bg-emerald-50 text-emerald-700'
                      : booking.bookingStatus === BOOKING_STATUS.PENDING
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {booking.bookingStatus}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    booking.paymentStatus === PAYMENT_STATUS.PAID
                      ? 'bg-emerald-50 text-emerald-700'
                      : booking.paymentStatus === PAYMENT_STATUS.UNPAID
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500 italic">
            Static data matching backend Booking model. Real bookings will load when the booking API is connected.
          </p>
        </div>
      </Card>
    </div>
  );
}
