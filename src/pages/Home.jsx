import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLE } from '../utils/constants';
import Button from '../components/common/Button';

const FEATURES = [
  { title: 'Seminars', desc: 'Talks and industry insights in one place.', icon: '🎤' },
  { title: 'Workshops', desc: 'Hands-on sessions and skill-building.', icon: '🛠️' },
  { title: 'Festivals', desc: 'Cultural and annual college events.', icon: '🎉' },
  { title: 'Club activities', desc: 'Clubs, societies, and competitions.', icon: '🎭' },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === USER_ROLE.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render home content if logged in (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <section className="relative overflow-hidden bg-gradient-hero text-white py-20 sm:py-28 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-90" />
        <div className="container-app relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            One place for all college events
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Seminars, workshops, festivals, and club activities. Stay informed, register easily, and never miss an event.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to={ROUTES.EVENTS}>
              <Button
                size="lg"
                className="min-w-[180px] bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg hover:shadow-xl border-2 border-primary-500"
              >
                Browse events
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button
                size="lg"
                className="min-w-[180px] bg-accent-500 hover:bg-accent-600 text-white font-bold shadow-lg hover:shadow-xl border-2 border-accent-400"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container-app py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
          What you can do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-gradient-card border border-slate-100 shadow-soft hover:shadow-soft-lg hover:border-primary-100 transition-all duration-200"
            >
              <span className="text-3xl block mb-4">{icon}</span>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
