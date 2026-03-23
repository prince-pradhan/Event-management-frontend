import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ROUTES, USER_ROLE } from '../../../utils/constants';
import { useAdminEvents } from '../../../hooks/useAdminEvents';
import StatusDropdown from './components/StatusDropdown';
import { useAuth } from '../../../context/AuthContext';
import { institutionsApi } from '../../../api/endpoints/institutions';

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function AdminEvents() {
  const { user, isSystemAdmin } = useAuth();
  
  // If the user is an institution admin, only fetch events for their institution.
  // System admins will fetch all events (institutionId = undefined).
  const institutionId = user?.role === USER_ROLE.INSTITUTION_ADMIN ? user.institution : undefined;
  
  const { events, loading, error, deleteEvent, updateEventStatus } = useAdminEvents(institutionId);

  const [institutionNameById, setInstitutionNameById] = useState({});

  // For institution-admin, we already have their institution name in auth context.
  const singleInstitutionName = !isSystemAdmin ? user?.institutionData?.name : null;

  useEffect(() => {
    if (!isSystemAdmin) return;
    if (!events?.length) return;

    const institutionIds = Array.from(
      new Set(
        events
          .map((e) => (e?.institution && typeof e.institution === 'string' ? e.institution : null))
          .filter(Boolean)
      )
    );

    if (institutionIds.length === 0) return;

    let mounted = true;

    async function loadInstitutionNames() {
      try {
        const missing = institutionIds.filter((id) => !institutionNameById[id]);
        if (missing.length === 0) return;

        const results = await Promise.all(
          missing.map((id) =>
            institutionsApi
              .getById(id)
              .then((r) => ({ id, name: r.data?.institution?.name || null }))
              .catch(() => ({ id, name: null }))
          )
        );

        if (!mounted) return;
        setInstitutionNameById((prev) => {
          const next = { ...prev };
          results.forEach(({ id, name }) => {
            next[id] = name;
          });
          return next;
        });
      } catch (e) {
        // Non-fatal: we can still render rows without institution name
        console.warn('Failed to load institution names for events:', e);
      }
    }

    loadInstitutionNames();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isSystemAdmin]);

  // Helper to resolve admin path based on role
  const getAdminPath = (path) => {
    const prefix = isSystemAdmin ? '/admin' : '/institution-admin';
    return path.replace('/admin', prefix);
  };

  if (loading) {
    return (
      <div className="container-app py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 font-medium">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 inline-block max-w-md">
          <p className="font-bold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm" variant="secondary">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <Link to={getAdminPath(ROUTES.ADMIN_DASHBOARD)} className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-block uppercase tracking-wider">
            ← Back to dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage events</h1>
          <p className="mt-1 text-slate-500 font-medium">Create, edit, and publish college events</p>
        </div>
        <Link to={getAdminPath(ROUTES.ADMIN_EVENTS_CREATE)}>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">+ New event</Button>
        </Link>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft-xl border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 uppercase tracking-[0.2em]">
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Event</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Category</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Date</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Seats</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Institution</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Status</th>
                <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-slate-400 font-medium">No events found. Click "New Event" to create one.</p>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{event.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{formatDate(event.startDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (1 - (event.availableSeats / event.totalSeats)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 italic">
                          {event.availableSeats ?? 0}/{event.totalSeats ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[160px]">
                        {singleInstitutionName ? (
                          <p className="text-xs font-bold text-slate-800 truncate" title={singleInstitutionName || ''}>
                            {singleInstitutionName || '—'}
                          </p>
                        ) : (
                          <>
                            <p
                              className="text-xs font-bold text-slate-800 truncate"
                              title={
                                (typeof event.institution === 'object' ? event.institution?.name : null) ||
                                institutionNameById[event.institution] ||
                                ''
                              }
                            >
                              {typeof event.institution === 'object'
                                ? (event.institution?.name || '—')
                                : (institutionNameById[event.institution] || '—')}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 truncate" title={event.organizer?.email || ''}>
                              {event.organizer?.email || ''}
                            </p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown
                        status={event.status}
                        onChange={(newStatus) => updateEventStatus(event._id, newStatus)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-5">
                        <Link
                          to={getAdminPath(ROUTES.ADMIN_EVENT_REGISTRATIONS.replace(':id', event._id))}
                          className="text-[10px] font-black text-slate-300 hover:text-primary-600 uppercase tracking-widest transition-colors"
                        >
                          Attendees
                        </Link>
                        <Link
                          to={getAdminPath(ROUTES.ADMIN_EVENT_REVIEWS.replace(':id', event._id))}
                          className="text-[10px] font-black text-slate-300 hover:text-primary-600 uppercase tracking-widest transition-colors"
                        >
                          Reviews
                        </Link>
                        <Link
                          to={getAdminPath(ROUTES.ADMIN_EVENT_EDIT.replace(':id', event._id))}
                          className="text-[10px] font-black text-slate-300 hover:text-primary-600 uppercase tracking-widest transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteEvent(event._id)}
                          className="text-[10px] font-black text-red-300 hover:text-red-600 uppercase tracking-widest transition-colors"
                        >
                          Delete
                        </button>
                      </div>
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

