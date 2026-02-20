import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES } from '../../utils/constants';
import { eventsApi, registrationsApi } from '../../api/endpoints';

const QUICK_LINKS = [
  { to: ROUTES.EVENTS, title: 'Browse events', description: 'Seminars, workshops, festivals & club activities', icon: '📅' },
  { to: ROUTES.STUDENT_MY_REGISTRATIONS, title: 'My registrations', description: 'Your registered events and tickets', icon: '🎫' },
  { to: ROUTES.STUDENT_NOTIFICATIONS, title: 'Notifications', description: 'Reminders and updates', icon: '🔔' },
];

export default function StudentDashboard() {
  const { user, isAdmin } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, regsRes] = await Promise.all([
          eventsApi.getAll({ limit: 5 }),
          registrationsApi.getMyRegistrations()
        ]);

        if (eventsRes.data.success) {
          setUpcomingEvents(eventsRes.data.events);
        }
        if (regsRes.data.success) {
          setMyRegistrations(regsRes.data.registrations);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.event?._id === eventId);
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
          Here&apos;s your overview. Browse events or check your registrations.
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
        <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Events</h2>
        <Card className="shadow-soft">
          {loading ? (
            <div className="py-8 text-center text-slate-500">
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
              Loading events...
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="py-12 text-center">
              <span className="text-4xl mb-4 block">🏜️</span>
              <p className="text-slate-600 font-medium">No upcoming events found.</p>
              <Link to={ROUTES.EVENTS} className="text-primary-600 hover:text-primary-700 text-sm font-bold mt-2 inline-block">
                Check back later
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Link key={event._id} to={`${ROUTES.EVENTS}/${event._id}`}>
                  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex flex-col items-center justify-center font-bold text-[10px] uppercase">
                      <span className="leading-none">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg leading-none mt-0.5">{new Date(event.startDate).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{event.title}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.location?.venue}
                      </p>
                    </div>
                    {isRegistered(event._id) ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        Inscribed
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        Open
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
