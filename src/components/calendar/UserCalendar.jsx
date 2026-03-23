import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, endOfWeek, startOfWeek, addDays, endOfMonth, startOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { registrationsApi } from '../../api/endpoints';
import Card from '../common/Card';
import Button from '../common/Button';

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Local date key (avoids UTC shifting).
function toDateKeyLocal(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getEventDateLocal(eventDate) {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getEventStatusForCalendar(reg, now) {
  const event = reg?.event || {};
  const eventStatus = event?.status;
  const registrationStatus = reg?.status;

  const eventEnd = getEventDateLocal(event?.endDate);
  const isCancelled =
    registrationStatus === 'CANCELLED' ||
    eventStatus === 'CANCELLED' ||
    eventStatus === 'CANCELLED'.toString();

  const isCompleted = !isCancelled && eventEnd ? eventEnd < now : false;

  if (isCancelled) return 'cancelled';
  if (isCompleted) return 'completed';
  return 'registered';
}

function statusMeta(status) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', dotClass: 'bg-blue-500', textClass: 'text-blue-700', bgClass: 'bg-blue-50' };
    case 'cancelled':
      return { label: 'Expired', dotClass: 'bg-red-500', textClass: 'text-red-700', bgClass: 'bg-red-50' };
    default:
      return { label: 'Registered', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50' };
  }
}

export default function UserCalendar() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await registrationsApi.getMyRegistrations();
        if (!mounted) return;
        if (res.data?.success) setRegistrations(res.data.registrations || []);
        else setRegistrations([]);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || 'Failed to load your registrations');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();

  const registrationsByDateKey = useMemo(() => {
    const map = new Map();

    registrations.forEach((reg) => {
      const event = reg?.event;
      const startLocal = getEventDateLocal(event?.startDate);
      if (!startLocal) return;

      const key = toDateKeyLocal(startLocal);
      const status = getEventStatusForCalendar(reg, now);
      const meta = statusMeta(status);

      const entry = { reg, status, meta, event };
      const arr = map.get(key) || [];
      arr.push(entry);
      map.set(key, arr);
    });

    return map;
  }, [registrations]);

  const selectedKey = toDateKeyLocal(selectedDate);
  const selectedEntries = registrationsByDateKey.get(selectedKey) || [];

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const computeDayBadge = (dateKey) => {
    const items = registrationsByDateKey.get(dateKey) || [];
    let registered = 0;
    let completed = 0;
    let cancelled = 0;
    items.forEach((it) => {
      if (it.status === 'completed') completed += 1;
      else if (it.status === 'cancelled') cancelled += 1;
      else registered += 1;
    });
    return { registered, completed, cancelled, total: items.length };
  };

  const selectedBadge = computeDayBadge(selectedKey);

  const onPrevMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d);
    // keep selectedDate inside the month view; if it was outside, align to 1st
    const newSelected = new Date(d.getFullYear(), d.getMonth(), 1);
    if (selectedDate.getMonth() !== d.getMonth() || selectedDate.getFullYear() !== d.getFullYear()) {
      setSelectedDate(newSelected);
    }
  };

  const onNextMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d);
    const newSelected = new Date(d.getFullYear(), d.getMonth(), 1);
    if (selectedDate.getMonth() !== d.getMonth() || selectedDate.getFullYear() !== d.getFullYear()) {
      setSelectedDate(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-heading text-slate-900">Your Calendar</h1>
          <p className="text-slate-600 mt-1">
            Marked dates show events you registered for (Registered / Completed / Expired).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onPrevMonth} className="px-3">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 rounded-2xl border border-slate-100 bg-white shadow-soft">
            <span className="text-sm font-black text-slate-900">{format(selectedMonth, 'MMMM yyyy')}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onNextMonth} className="px-3">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-white">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Registered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-black text-red-700 uppercase tracking-wider">Expired</span>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500">
            {loading ? 'Loading your registrations…' : `${selectedEntries.length} event(s) on ${format(selectedDate, 'MMM d, yyyy')}`}
          </div>
        </div>

        {error && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-medium">
            {error}
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => (
                  <div key={w} className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 py-1">
                    {w}
                  </div>
                ))}

                {days.map((d) => {
                  const dateKey = toDateKeyLocal(d);
                  const badge = computeDayBadge(dateKey);
                  const isInMonth = isSameMonth(d, monthStart);
                  const isSelected = isSameDay(d, selectedDate);

                  const maxDots = 3;
                  const dotItems = [
                    badge.registered > 0 ? { color: 'bg-emerald-500' } : null,
                    badge.completed > 0 ? { color: 'bg-blue-500' } : null,
                    badge.cancelled > 0 ? { color: 'bg-red-500' } : null,
                  ].filter(Boolean).slice(0, maxDots);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={[
                        'relative h-20 sm:h-16 rounded-2xl border transition-all text-left px-2 py-2',
                        isInMonth ? 'bg-white border-slate-100 hover:border-primary-200' : 'bg-slate-50 border-slate-100/80 opacity-70',
                        isSelected ? 'border-primary-300 ring-2 ring-primary-200' : 'hover:bg-primary-50/60',
                      ].join(' ')}
                      aria-label={`Select ${format(d, 'MMM d, yyyy')}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-black text-slate-700">
                          {d.getDate()}
                        </div>

                        {badge.total > 0 && (
                          <div className="text-[10px] font-black text-slate-600 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                            {badge.total}
                          </div>
                        )}
                      </div>

                      {badge.total > 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          {dotItems.map((it, idx) => (
                            <span key={idx} className={`w-2.5 h-2.5 rounded-full ${it.color}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {format(selectedDate, 'EEE, MMM d')}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {loading ? 'Updating…' : selectedEntries.length > 0 ? 'Registered events' : 'No registrations'}
                    </p>
                  </div>

                  {selectedEntries.length > 0 && (
                    <div className="text-xs font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                      {selectedBadge.completed} completed • {selectedBadge.registered} upcoming • {selectedBadge.cancelled} expired
                    </div>
                  )}
                </div>

                {loading && selectedEntries.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading calendar…</p>
                  </div>
                ) : selectedEntries.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50/40 rounded-2xl border border-slate-100/60">
                    <p className="text-3xl mb-3">🗓️</p>
                    <p className="text-slate-900 font-black">No events for this date</p>
                    <p className="text-slate-500 mt-1 text-sm">Register for an event to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-auto pr-1" style={{ maxHeight: 520 }}>
                    {[...selectedEntries].sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate)).map((entry) => {
                      const ev = entry.event || {};
                      const meta = statusMeta(entry.status);
                      const start = getEventDateLocal(ev.startDate);
                      const end = getEventDateLocal(ev.endDate);
                      return (
                        <Card
                          key={entry.reg._id}
                          padding={true}
                          className={`hover:shadow-soft-lg ${meta.bgClass} border ${entry.status === 'completed' ? 'border-blue-100' : entry.status === 'cancelled' ? 'border-red-100' : 'border-emerald-100'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/events/${ev._id}`}
                                className="block text-base font-black text-slate-900 hover:text-primary-600 transition-colors truncate"
                              >
                                {ev.title || 'Untitled event'}
                              </Link>

                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <div>
                                  <span className="font-bold text-slate-700">Start:</span>{' '}
                                  {start ? format(start, 'HH:mm') : '—'}
                                </div>
                                {end && (
                                  <div>
                                    <span className="font-bold text-slate-700">End:</span>{' '}
                                    {format(end, 'HH:mm')}
                                  </div>
                                )}
                                {ev.location?.venue && <div className="truncate">{ev.location.venue}</div>}
                              </div>
                            </div>

                            <div className="shrink-0">
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${meta.textClass} border ${entry.status === 'completed' ? 'border-blue-200' : entry.status === 'cancelled' ? 'border-red-200' : 'border-emerald-200'} bg-white/60`}>
                                {meta.label}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <div className="mt-5">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setSelectedMonth(today);
                    }}
                    disabled={loading}
                  >
                    Jump to Today
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

