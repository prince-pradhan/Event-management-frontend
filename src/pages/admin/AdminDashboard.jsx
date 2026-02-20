import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES } from '../../utils/constants';
import { eventsApi, authApi } from '../../api/endpoints';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Total events', value: '-', sub: 'Loading...', icon: '📅' },
    { label: 'Total users', value: '-', sub: 'Loading...', icon: '👥' },
    { label: 'Total bookings', value: '-', sub: 'Total registrations', icon: '🎫' },
  ]);
  const [loading, setLoading] = useState(true);

  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, usersRes] = await Promise.all([
          eventsApi.getAll({ limit: 1 }), // Just to get total count
          authApi.getUsers(),
        ]);

        const totalEvents = eventsRes.data.pagination?.total || 0;
        const totalUsers = usersRes.data.users?.length || 0;

        setStats([
          { label: 'Total events', value: totalEvents.toString(), sub: 'Upcoming & past', icon: '📅' },
          { label: 'Total users', value: totalUsers.toString(), sub: 'Students & admins', icon: '👥' },
          { label: 'Total bookings', value: '—', sub: 'Across events', icon: '🎫' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  return (
    <div className="container-app py-10">
      {user && !user.isVerified && !bannerDismissed && (
        <VerificationBanner onDismiss={handleDismissBanner} />
      )}
      <h1 className="page-heading text-slate-900 mb-2">Admin panel</h1>
      <p className="text-slate-600 mb-10">Overview and quick actions</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 shadow-soft">
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to={ROUTES.ADMIN_EVENTS}>
          <Card hover className="h-full shadow-soft hover:shadow-soft-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">📋</div>
              <div>
                <h3 className="font-bold text-slate-900">Manage events</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Create, edit, and publish events. View attendee lists and manage event status.
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to={ROUTES.ADMIN_USERS}>
          <Card hover className="h-full shadow-soft hover:shadow-soft-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-2xl">👥</div>
              <div>
                <h3 className="font-bold text-slate-900">Manage users</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  View and manage registered users. Check verification status and roles.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* {!loading && (
        <div className="mt-10 p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
            Live dashboard data connected
          </p>
        </div>
      )} */}
    </div>
  );
}
