import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES, EVENT_STATUS } from '../../utils/constants';

/**
 * Backend Event model: title, description, category (ref), organizer (ref),
 * location { venue, address, city }, startDate, endDate, totalSeats, availableSeats,
 * price, status (DRAFT|PUBLISHED|CANCELLED|COMPLETED), bannerImage
 * Static rows match this shape.
 */
const STATIC_EVENTS = [
  { _id: '1', title: 'Tech Workshop: Intro to Web Dev', category: { name: 'Workshop' }, startDate: '2025-01-15T10:00:00', totalSeats: 50, availableSeats: 45, status: EVENT_STATUS.PUBLISHED },
  { _id: '2', title: 'Annual College Festival', category: { name: 'Festival' }, startDate: '2025-02-20T09:00:00', totalSeats: 500, availableSeats: 500, status: EVENT_STATUS.PUBLISHED },
  { _id: '3', title: 'Career Seminar: Industry Insights', category: { name: 'Seminar' }, startDate: '2024-12-20T14:00:00', totalSeats: 80, availableSeats: 0, status: EVENT_STATUS.COMPLETED },
  { _id: '4', title: 'Drama Club – Annual Play', category: { name: 'Club Activity' }, startDate: '2025-03-05T18:00:00', totalSeats: 120, availableSeats: 120, status: EVENT_STATUS.DRAFT },
];

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function AdminEvents() {
  return (
    <div className="container-app py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link to={ROUTES.ADMIN} className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to admin
          </Link>
          <h1 className="page-heading text-slate-900">Manage events</h1>
          <p className="mt-1 text-slate-600">Create, edit, and publish (Event model)</p>
        </div>
        <Button className="bg-accent-500 hover:bg-accent-600 text-white">+ New event</Button>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Seats</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STATIC_EVENTS.map((event) => (
                <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{event.title}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{event.category?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(event.startDate)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{event.availableSeats ?? '—'} / {event.totalSeats ?? '—'}</td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500 italic">
            Static data matching backend Event model. Real events will be manageable when the API is connected.
          </p>
        </div>
      </Card>
    </div>
  );
}
