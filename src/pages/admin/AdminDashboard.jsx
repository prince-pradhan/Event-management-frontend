import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  ChevronRight,
  Plus,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Sparkles,
  Target,
  Layers,
  PieChart as PieIcon,
  Tag,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES, EVENT_STATUS } from '../../utils/constants';
import { eventsApi, authApi, registrationsApi } from '../../api/endpoints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Aligned to the landing page theme: teal primary, amber accent, slate neutrals.
const THEME = {
  primary: '#0d9488', // primary-600 (teal)
  primaryLight: '#14b8a6', // primary-500
  primarySoft: 'rgba(13, 148, 136, 0.85)',
  accent: '#f59e0b', // accent-500 (amber)
  emerald: '#10b981',
  rose: '#f43f5e',
  slate: '#64748b',
};
const PALETTE = ['#0d9488', '#f59e0b', '#0f766e', '#fbbf24', '#14b8a6', '#b45309', '#5eead4', '#92400e'];

export default function AdminDashboard({ showUsersCard = true, institutionOnly = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const instId = typeof user?.institution === 'object' ? user?.institution?._id : user?.institution;

        const eventsRes = institutionOnly && instId
          ? await eventsApi.getByInstitution(instId, { limit: 500 })
          : await eventsApi.getAll({ limit: 500 });

        const usersRes = showUsersCard
          ? await authApi.getUsers().catch(() => ({ data: { users: [] } }))
          : { data: { users: [] } };

        const evts = eventsRes.data.events || [];
        setEvents(evts);
        setUsers(usersRes.data.users || []);

        if (evts.length > 0) {
          handleEventClick(evts[0]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, institutionOnly, showUsersCard]);

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setLoadingAttendees(true);
    try {
      const res = await registrationsApi.getByEvent(event._id);
      if (res.data.success) {
        setAttendees(res.data.registrations || []);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Compute KPIs from event data
  const kpis = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.startDate) > now && e.status === EVENT_STATUS.PUBLISHED);
    const live = events.filter(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return start <= now && now <= end && e.status === EVENT_STATUS.PUBLISHED;
    });
    const completed = events.filter(e => new Date(e.endDate) < now);

    const totalRegistrations = events.reduce((acc, ev) => {
      const seats = (ev.totalSeats || 0) - (ev.availableSeats || 0);
      return acc + Math.max(0, seats);
    }, 0);

    const revenue = events.reduce((acc, ev) => {
      if (ev.isFree) return acc;
      const seatsTaken = (ev.totalSeats || 0) - (ev.availableSeats || 0);
      return acc + (Number(ev.price || 0) * Math.max(0, seatsTaken));
    }, 0);

    const fillRates = events
      .filter(e => e.totalSeats > 0)
      .map(e => ((e.totalSeats - (e.availableSeats || 0)) / e.totalSeats) * 100);
    const avgFillRate = fillRates.length
      ? Math.round(fillRates.reduce((a, b) => a + b, 0) / fillRates.length)
      : 0;

    return {
      totalEvents: events.length,
      totalUsers: users.length,
      totalRegistrations,
      revenue,
      upcoming: upcoming.length,
      live: live.length,
      completed: completed.length,
      avgFillRate,
    };
  }, [events, users]);

  // Top events by attendance
  const topEventsChart = useMemo(() => {
    const sorted = [...events]
      .map(e => ({
        title: e.title,
        attendees: Math.max(0, (e.totalSeats || 0) - (e.availableSeats || 0)),
        capacity: e.totalSeats || 0,
      }))
      .filter(e => e.capacity > 0)
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 7);

    return {
      labels: sorted.map(e => (e.title.length > 18 ? e.title.slice(0, 18) + '…' : e.title)),
      datasets: [
        {
          label: 'Registered',
          data: sorted.map(e => e.attendees),
          backgroundColor: THEME.primarySoft,
          borderRadius: 8,
          stack: 's',
        },
        {
          label: 'Available',
          data: sorted.map(e => Math.max(0, e.capacity - e.attendees)),
          backgroundColor: 'rgba(226, 232, 240, 0.9)',
          borderRadius: 8,
          stack: 's',
        },
      ],
    };
  }, [events]);

  // Event status distribution
  const statusChart = useMemo(() => {
    const counts = events.reduce((acc, ev) => {
      const k = ev.status || 'UNKNOWN';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(counts);
    // Stable color per status so the legend reads consistently across renders.
    const statusColors = {
      PUBLISHED: THEME.primary,
      DRAFT: THEME.accent,
      CANCELLED: THEME.rose,
      COMPLETED: THEME.slate,
    };
    return {
      labels,
      datasets: [
        {
          data: labels.map(l => counts[l]),
          backgroundColor: labels.map(l => statusColors[l] || '#cbd5e1'),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [events]);

  // Free vs Paid mix
  const monetisationChart = useMemo(() => {
    const free = events.filter(e => e.isFree).length;
    const paid = events.length - free;
    return {
      labels: ['Free', 'Paid'],
      datasets: [
        {
          data: [free, paid],
          backgroundColor: [THEME.primary, THEME.accent],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [events]);

  // Events created over the last 6 months
  const trendChart = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString('en-US', { month: 'short' }),
        count: 0,
      });
    }
    events.forEach(ev => {
      if (!ev.createdAt) return;
      const d = new Date(ev.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find(b => b.key === key);
      if (bucket) bucket.count += 1;
    });
    return {
      labels: buckets.map(b => b.label),
      datasets: [
        {
          label: 'Events created',
          data: buckets.map(b => b.count),
          borderColor: THEME.primary,
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(13,148,136,0.2)';
            const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(13,148,136,0.45)');
            gradient.addColorStop(1, 'rgba(13,148,136,0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: THEME.primary,
          pointBorderWidth: 2,
        },
      ],
    };
  }, [events]);

  // Top categories (polar area)
  const categoryChart = useMemo(() => {
    const counts = events.reduce((acc, ev) => {
      const name = ev.category?.name || 'Uncategorized';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      labels: sorted.map(([k]) => k),
      datasets: [
        {
          data: sorted.map(([, v]) => v),
          backgroundColor: PALETTE.map(c => c + 'cc'),
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };
  }, [events]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  const getAdminPath = (path) => {
    const prefix = institutionOnly ? '/institution-admin' : '/admin';
    return path.replace('/admin', prefix);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12 bg-slate-50/30 min-h-screen">
      {user && !user.isVerified && !bannerDismissed && (
        <VerificationBanner onDismiss={handleDismissBanner} />
      )}

      {/* Hero header — mirrors the dark/teal aesthetic from the landing hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/40 via-slate-900 to-slate-900" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 20%, rgba(20,184,166,0.45), transparent 45%), radial-gradient(circle at 82% 70%, rgba(245,158,11,0.25), transparent 50%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 lg:p-10">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold mb-4 border border-primary-500/30 uppercase tracking-[0.2em]">
              {institutionOnly ? 'Institution Admin' : 'System Admin'}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                {user?.name?.split(' ')[0] || 'Admin'}
              </span>{' '}
              👋
            </h1>
            <p className="mt-3 text-slate-300 font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              {kpis.live > 0
                ? `${kpis.live} event${kpis.live > 1 ? 's' : ''} live right now`
                : `${kpis.upcoming} upcoming event${kpis.upcoming === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(getAdminPath(ROUTES.ADMIN_EVENTS_CREATE))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-900/30 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
            <button
              onClick={() => navigate(getAdminPath('/admin/events'))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold border border-white/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Manage Events
            </button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard
          label="Total Events"
          value={kpis.totalEvents}
          icon={<Calendar className="w-5 h-5" />}
          tint="from-primary-500 to-primary-700"
          delta={`${kpis.upcoming} upcoming`}
          deltaIcon={<Sparkles className="w-3 h-3" />}
          onClick={() => navigate(getAdminPath('/admin/events'))}
        />
        <KpiCard
          label="Total Registrations"
          value={kpis.totalRegistrations.toLocaleString()}
          icon={<TrendingUp className="w-5 h-5" />}
          tint="from-primary-400 to-primary-600"
          delta={`${kpis.completed} completed events`}
          deltaIcon={<CheckCircle2 className="w-3 h-3" />}
        />
        <KpiCard
          label="Revenue Earned"
          value={`$${kpis.revenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          tint="from-accent-400 to-accent-600"
          delta={`${events.filter(e => !e.isFree).length} paid events`}
          deltaIcon={<Tag className="w-3 h-3" />}
        />
        {showUsersCard ? (
          <KpiCard
            label="Total Users"
            value={kpis.totalUsers.toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            tint="from-slate-700 to-slate-900"
            delta="across all roles"
            deltaIcon={<Layers className="w-3 h-3" />}
            onClick={() => navigate('/admin/users')}
          />
        ) : (
          <KpiCard
            label="Avg Fill Rate"
            value={`${kpis.avgFillRate}%`}
            icon={<Target className="w-5 h-5" />}
            tint="from-slate-700 to-slate-900"
            delta={`${kpis.live} live now`}
            deltaIcon={<Activity className="w-3 h-3" />}
          />
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 lg:col-span-2 shadow-soft border-0">
          <ChartHeader icon={<TrendingUp className="w-4 h-4" />} title="Events created" subtitle="Last 6 months" />
          <div className="h-[280px] mt-4">
            <Line
              data={trendChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                interaction: { mode: 'index', intersect: false },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { precision: 0 } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </Card>

        <Card className="p-6 shadow-soft border-0">
          <ChartHeader icon={<PieIcon className="w-4 h-4" />} title="Status mix" subtitle="All events" />
          <div className="h-[240px] mt-4 flex items-center justify-center">
            {events.length === 0 ? (
              <EmptyState message="No events yet" />
            ) : (
              <Doughnut
                data={statusChart}
                options={{
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
                  },
                }}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 lg:col-span-2 shadow-soft border-0">
          <ChartHeader icon={<BarChart3 className="w-4 h-4" />} title="Top events by attendance" subtitle="Registered vs available seats" />
          <div className="h-[280px] mt-4">
            {events.length === 0 ? (
              <EmptyState message="No events to chart" />
            ) : (
              <Bar
                data={topEventsChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
                    tooltip: { mode: 'index', intersect: false },
                  },
                  scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { precision: 0 } },
                  },
                }}
              />
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 shadow-soft border-0">
            <ChartHeader icon={<DollarSign className="w-4 h-4" />} title="Free vs Paid" />
            <div className="h-[160px] mt-4">
              {events.length === 0 ? (
                <EmptyState message="No data" small />
              ) : (
                <Doughnut
                  data={monetisationChart}
                  options={{
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 11 } } } },
                  }}
                />
              )}
            </div>
          </Card>
          <Card className="p-6 shadow-soft border-0">
            <ChartHeader icon={<Tag className="w-4 h-4" />} title="Top categories" />
            <div className="h-[160px] mt-4">
              {events.length === 0 ? (
                <EmptyState message="No data" small />
              ) : (
                <PolarArea
                  data={categoryChart}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } },
                    scales: { r: { ticks: { display: false }, grid: { color: 'rgba(148,163,184,0.15)' } } },
                  }}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent events table + attendees panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-soft border-0 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <ChartHeader icon={<Clock className="w-4 h-4" />} title="Recent events" subtitle="Click a row to inspect attendees" inline />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(getAdminPath('/admin/events'))}
              className="text-xs"
            >
              View all
            </Button>
          </div>
          {events.length === 0 ? (
            <EmptyState message="No events created yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fill</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {events.slice(0, 6).map(event => {
                    const taken = (event.totalSeats || 0) - (event.availableSeats || 0);
                    const ratio = event.totalSeats ? (taken / event.totalSeats) * 100 : 0;
                    return (
                      <tr
                        key={event._id}
                        className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedEvent?._id === event._id ? 'bg-primary-50/50' : ''}`}
                        onClick={() => handleEventClick(event)}
                      >
                        <td className="py-4">
                          <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-1">{event.title}</p>
                          <p className="text-xs text-slate-400">{new Date(event.startDate).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 text-center">
                          <StatusBadge status={event.status} />
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${event.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {event.isFree ? 'FREE' : `$${event.price}`}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-slate-700">{taken}/{event.totalSeats || 0}</span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${ratio >= 90 ? 'bg-rose-500' : ratio >= 60 ? 'bg-accent-500' : 'bg-primary-500'}`}
                                style={{ width: `${Math.min(100, ratio)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getAdminPath(ROUTES.ADMIN_EVENT_REGISTRATIONS.replace(':id', event._id)));
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="View Attendees"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getAdminPath(`/admin/events/${event._id}`));
                              }}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                              title="View Details"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6 shadow-soft border-0">
          <div className="flex items-center justify-between mb-6">
            <ChartHeader icon={<Users className="w-4 h-4" />} title="Attendees" inline />
            {selectedEvent && (
              <span className="text-[10px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded line-clamp-1 max-w-[140px]">
                {selectedEvent.title}
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingAttendees ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : !selectedEvent ? (
              <EmptyState message="Select an event to see attendees" small />
            ) : attendees.length === 0 ? (
              <EmptyState message="No attendees yet" small />
            ) : (
              attendees.map(reg => (
                <div key={reg._id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-xs uppercase shadow">
                    {(reg.user?.name || '??').substring(0, 2)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{reg.user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{reg.user?.email}</p>
                  </div>
                  {reg.paymentStatus === 'PAID' || reg.paymentStatus === 'NOT_REQUIRED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, tint, delta, deltaIcon, onClick }) {
  return (
    <Card
      className={`p-6 shadow-soft border-0 transition-all group overflow-hidden relative ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}`}
      onClick={onClick}
    >
      <div className="relative z-10">
        <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${tint} text-white w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-3xl font-black text-slate-900 tabular-nums">{value}</p>
        {delta && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 rounded-full px-2.5 py-1">
            {deltaIcon}
            <span>{delta}</span>
          </div>
        )}
      </div>
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-gradient-to-br ${tint} opacity-[0.07] group-hover:scale-150 transition-transform duration-500`} />
    </Card>
  );
}

function ChartHeader({ icon, title, subtitle, inline = false }) {
  return (
    <div className={inline ? 'flex items-center gap-3' : ''}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary-50 text-primary-600">{icon}</div>
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PUBLISHED: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
    COMPLETED: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || '—'}
    </span>
  );
}

function EmptyState({ message, small = false }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center ${small ? 'py-4' : 'py-8'}`}>
      <div className="text-3xl mb-2 opacity-50">📊</div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{message}</p>
    </div>
  );
}
