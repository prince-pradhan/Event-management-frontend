import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES } from '../../utils/constants';

/**
 * Static stats; backend will provide real counts (events, users, bookings).
 */
const STATS = [
  { label: 'Total events', value: '12', sub: '4 upcoming', icon: '📅' },
  { label: 'Total users', value: '248', sub: 'Students & admins', icon: '👥' },
  { label: 'Bookings this month', value: '89', sub: 'Across all events', icon: '🎫' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

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
        {STATS.map((stat) => (
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
              <span className="text-3xl">📋</span>
              <div>
                <h3 className="font-bold text-slate-900">Manage events</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Create, edit, and publish events (Event model: title, category, organizer, location, startDate, endDate, totalSeats, price, status).
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to={ROUTES.ADMIN_USERS}>
          <Card hover className="h-full shadow-soft hover:shadow-soft-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl">👥</span>
              <div>
                <h3 className="font-bold text-slate-900">Manage users</h3>
                <p className="text-sm text-slate-600 mt-1">
                  View and manage users (User model: name, email, role, isVerified).
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="mt-10 p-6 bg-slate-50/50 border-slate-100 shadow-soft">
        <p className="text-sm text-slate-500 italic">
          Stats above are static. Real data will load when the backend APIs are connected.
        </p>
      </Card>
    </div>
  );
}
