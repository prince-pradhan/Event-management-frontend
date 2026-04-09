import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  ChevronRight,
  Plus,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle
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
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES } from '../../utils/constants';
import { eventsApi, authApi, registrationsApi } from '../../api/endpoints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard({ showUsersCard = true, institutionOnly = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    activeRegistrations: 0,
    revenue: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
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
        // Resolve institution for institution-only dashboards
        const instId = typeof user?.institution === 'object' ? user?.institution?._id : user?.institution;

        // Events: fetch by institution if required and available, otherwise all
        const eventsRes = institutionOnly && instId
          ? await eventsApi.getByInstitution(instId, { limit: 5 })
          : await eventsApi.getAll({ limit: 5 });

        // Users: only fetch when user card should be shown (system admin view)
        const usersRes = showUsersCard
          ? await authApi.getUsers()
          : { data: { users: [] } };

        const events = eventsRes.data.events || [];
        const users = usersRes.data.users || [];
        
        setRecentEvents(events);
        
        // Mock activity for now based on recent events
        const activities = events.map(event => ({
          id: event._id,
          type: 'event_created',
          user: 'Admin',
          target: event.title,
          time: new Date(event.createdAt).toLocaleDateString()
        }));
        setRecentActivity(activities);

        setStats({
          totalEvents: eventsRes.data.pagination?.total || events.length,
          totalUsers: users.length,
          activeRegistrations: events.reduce((acc, ev) => acc + (ev.totalSeats - ev.availableSeats || 0), 0),
          revenue: events.reduce((acc, ev) => acc + (ev.price * (ev.totalSeats - ev.availableSeats || 0) || 0), 0)
        });

        if (events.length > 0) {
          handleEventClick(events[0]);
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
    } finally {
      setLoadingAttendees(false);
    }
  };

  const chartData = useMemo(() => ({
    labels: recentEvents.map(e => e.title.substring(0, 10) + '...'),
    datasets: [
      {
        label: 'Attendees',
        data: recentEvents.map(e => e.totalSeats - e.availableSeats || 0),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 8,
      }
    ]
  }), [recentEvents]);

  const doughnutData = useMemo(() => ({
    labels: ['Free Events', 'Paid Events'],
    datasets: [
      {
        data: [
          recentEvents.filter(e => e.isFree).length,
          recentEvents.filter(e => !e.isFree).length
        ],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 0,
      }
    ]
  }), [recentEvents]);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12 bg-slate-50/30 min-h-screen">
      {user && !user.isVerified && !bannerDismissed && (
        <VerificationBanner onDismiss={handleDismissBanner} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="primary" 
            className="flex items-center gap-2 shadow-lg shadow-primary-900/20"
            onClick={() => navigate(ROUTES.ADMIN_CREATE_EVENT)}
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Events" value={stats.totalEvents} icon={<Calendar className="w-6 h-6" />} color="bg-blue-500" />
        {showUsersCard && (
          <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6" />} color="bg-purple-500" />
        )}
        <StatCard label="Total Attendees" value={stats.activeRegistrations} icon={<TrendingUp className="w-6 h-6" />} color="bg-emerald-500" />
        <StatCard label="Revenue" value={`$${stats.revenue}`} icon={<BarChart3 className="w-6 h-6" />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Analytics Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" />
                Event Attendance
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                }} 
              />
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Recent Events
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Seats</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEvents.map(event => (
                    <tr 
                      key={event._id} 
                      className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedEvent?._id === event._id ? 'bg-primary-50/50' : ''}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <td className="py-4">
                        <p className="font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{event.title}</p>
                        <p className="text-xs text-slate-400">{new Date(event.startDate).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`text-xs font-black px-2 py-1 rounded-lg ${event.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {event.isFree ? 'FREE' : `$${event.price}`}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-700">{event.totalSeats - event.availableSeats}/{event.totalSeats}</span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-primary-500" 
                              style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          <Card className="p-6 shadow-soft border-0">
            <h3 className="text-lg font-black text-slate-900 mb-6">Event Mix</h3>
            <div className="h-[200px]">
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </Card>

          <Card className="p-6 shadow-soft border-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Attendees</h3>
              {selectedEvent && (
                <span className="text-[10px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">
                  {selectedEvent.title.substring(0, 10)}...
                </span>
              )}
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingAttendees ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 italic">No attendees for this event yet.</p>
                </div>
              ) : (
                attendees.map(reg => (
                  <div key={reg._id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-xs uppercase">
                      {reg.user?.name?.substring(0, 2) || '??'}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{reg.user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{reg.user?.email}</p>
                    </div>
                    {reg.paymentStatus === 'PAID' ? (
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
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <Card className="p-6 shadow-soft border-0 hover:shadow-lg transition-all group overflow-hidden relative">
      <div className="relative z-10">
        <div className={`p-3 rounded-2xl ${color} text-white w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${color} opacity-[0.03] group-hover:scale-150 transition-transform duration-500`} />
    </Card>
  );
}

function Loader2({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
