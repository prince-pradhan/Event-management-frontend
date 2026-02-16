import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES, EVENT_STATUS } from '../../utils/constants';
import { eventsApi } from '../../api/endpoints/events';

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        // Backend returns { success: true, events: [...], pagination: {...} }
        if (response.data.success) {
          setEvents(response.data.events);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await eventsApi.delete(eventId);
      if (res.data.success) {
        setEvents(prev => prev.filter(e => e._id !== eventId));
      }
    } catch (err) {
      console.error('Failed to delete event', err);
      alert('Failed to delete event');
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const res = await eventsApi.updateStatus(eventId, newStatus);
      if (res.data.success) {
        setEvents(prev => prev.map(e =>
          e._id === eventId ? { ...e, status: newStatus } : e
        ));
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="container-app py-10 text-center">
        <p className="text-slate-500">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4" size="sm">Retry</Button>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to dashboard
          </Link>
          <h1 className="page-heading text-slate-900">Manage events</h1>
          <p className="mt-1 text-slate-600">Create, edit, and publish events</p>
        </div>
        <Link to={ROUTES.ADMIN_EVENTS_CREATE}>
          <Button className="bg-accent-500 hover:bg-accent-600 text-white">+ New event</Button>
        </Link>
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
              {events.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No events found. Click "New Event" to create one.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{event.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{event.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(event.startDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{event.availableSeats ?? '—'} / {event.totalSeats ?? '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={event.status}
                        onChange={(e) => handleStatusChange(event._id, e.target.value)}
                        className={`block w-full max-w-[140px] rounded-lg border-0 py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset ${event.status === EVENT_STATUS.PUBLISHED
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : event.status === EVENT_STATUS.DRAFT
                              ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                              : event.status === EVENT_STATUS.CANCELLED
                                ? 'bg-red-50 text-red-700 ring-red-600/20'
                                : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                          } focus:ring-2 focus:ring-primary-600 sm:leading-6`}
                      >
                        {Object.values(EVENT_STATUS).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/events/${event._id}/edit`}>
                        <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          Edit
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(event._id)}
                        className="ml-4 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
