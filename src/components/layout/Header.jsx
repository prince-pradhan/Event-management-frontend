import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, ROUTES } from '../../utils/constants';
import Button from '../common/Button';
import UserMenu from './UserMenu';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, isAdmin } = useAuth();

  // Show Home/Events nav for everyone, or specific logic
  const navLinks = [
    { to: ROUTES.HOME, label: 'Home' },
    { to: ROUTES.EVENTS, label: 'Events' },
  ];

  // Logo links to dashboard when logged in, home when not
  const logoLink = isAuthenticated
    ? (isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD)
    : ROUTES.HOME;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-soft">
      <div className="container-app">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          <Link
            to={logoLink}
            className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent"
          >
            {APP_NAME}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-medium hover:text-primary-600 hover:bg-primary-50/80 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button size="sm" className="bg-accent-500 hover:bg-accent-600 text-white">
                    Get started
                  </Button>
                </Link>
              </>
            )}

            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50"
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)} className="px-4 py-3">
                    Login
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)} className="px-4 py-3">
                    <Button size="sm" className="w-full bg-accent-500 hover:bg-accent-600 text-white">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
