import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES } from '../../utils/constants';

const QUICK_LINKS = [
  { to: ROUTES.EVENTS, title: 'Browse events', description: 'Seminars, workshops, festivals & club activities', icon: '📅' },
  { to: ROUTES.STUDENT_MY_BOOKINGS, title: 'My bookings', description: 'Your registered events and tickets', icon: '🎫' },
  { to: ROUTES.STUDENT_NOTIFICATIONS, title: 'Notifications', description: 'Reminders and updates', icon: '🔔' },
];

export default function StudentDashboard() {
  const { user, isAdmin } = useAuth();
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
      <div className="mb-10">
        <h1 className="page-heading text-slate-900">
          Hello, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="mt-2 text-slate-600">
          Here&apos;s your overview. Browse events or check your bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {QUICK_LINKS.map(({ to, title, description, icon }) => (
          <Link key={to} to={to}>
            <Card hover className="h-full shadow-soft hover:shadow-soft-lg">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {isAdmin && (
          <Link to={ROUTES.ADMIN_DASHBOARD}>
            <Card hover className="h-full border-2 border-primary-200 bg-primary-50/30 shadow-soft">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚙️</span>
                <div>
                  <h3 className="font-bold text-primary-700">Admin panel</h3>
                  <p className="text-sm text-slate-600 mt-1">Manage events and users</p>
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming (static preview)</h2>
        <Card className="shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                Jan
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Tech Workshop: Intro to Web Dev</p>
                <p className="text-sm text-slate-500">Jan 15, 2025 · Main Hall</p>
              </div>
              <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-lg">
                Registered
              </span>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                Feb
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Annual College Festival</p>
                <p className="text-sm text-slate-500">Feb 20–22, 2025 · Campus Grounds</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                Open
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 italic">
            This section will show real upcoming events when the backend is connected.
          </p>
        </Card>
      </section>
    </div>
  );
}
