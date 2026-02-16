import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLE } from '../../utils/constants';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(ROUTES.HOME);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const dashboardRoute = isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-primary-50/80 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-sm font-bold flex items-center justify-center shadow-soft">
          {initials}
        </span>
        <span className="hidden sm:block text-sm font-semibold text-slate-700 max-w-[120px] truncate">
          {user?.name}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-soft-lg border border-slate-100 py-2 z-50 animate-slide-up">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            {user?.role === USER_ROLE.ADMIN && (
              <span className="inline-block mt-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
                Admin
              </span>
            )}
          </div>
          <Link
            to={dashboardRoute}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50"
          >
            Dashboard
          </Link>
          <Link
            to={ROUTES.STUDENT_PROFILE}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50"
          >
            Profile
          </Link>
          {isAdmin && (
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
            >
              Admin Panel
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
