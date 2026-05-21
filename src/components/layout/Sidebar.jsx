import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ROUTES, USER_ROLE } from '../../utils/constants';

const navItems = [
    {
        name: 'Dashboard', path: '/admin/dashboard', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    },
    {
        name: 'Events', path: ROUTES.ADMIN_EVENTS, icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    },
    {
        name: 'Notifications', path: '/admin/notifications', role: [USER_ROLE.INSTITUTION_ADMIN, USER_ROLE.SYSTEM_ADMIN, USER_ROLE.ADMIN], icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        )
    },
    {
        name: 'Institutions', path: '/admin/institutions', isSystemAdminOnly: true, icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        name: 'Users', path: '/admin/users', isSystemAdminOnly: true, icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )
    },
    {
        name: 'Categories', path: '/admin/categories', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        )
    },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user, logout, isSystemAdmin, isInstitutionAdmin } = useAuth();
    const { pendingInstitutions } = useNotifications();
    const location = useLocation();

    // Determine path prefix based on role
    const pathPrefix = isSystemAdmin ? '/admin' : '/institution-admin';

    const filteredNavItems = navItems.map(item => {
        let path = item.path;
        
        // Rewrite path for Institution Admin if it starts with /admin
        if (isInstitutionAdmin && path.startsWith('/admin')) {
            path = path.replace('/admin', '/institution-admin');
        }

        if (item.name === 'Institutions') {
            return { ...item, path, badge: pendingInstitutions };
        }
        return { ...item, path };
    }).filter(item => {
        if (item.isSystemAdminOnly && !isSystemAdmin) return false;
        if (item.role && !item.role.includes(user?.role)) return false;
        return true;
    });

    return (
        <>
            {/* Backdrop for Mobile */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-100 z-50 transition-transform duration-300 ease-in-out transform shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 mb-10 group px-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/30 group-hover:rotate-6 transition-transform">
                            E
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">EduEvents<span className="text-primary-600">.</span></span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Menu</p>
                        {filteredNavItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                {item.badge > 0 && (
                                    <span className="ml-auto bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Profile & Footer */}
                    <div className="pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-50 shadow-inner group">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm relative overflow-hidden font-black">
                                {isInstitutionAdmin && user?.institutionData?.name ? user.institutionData.name.charAt(0) : (user?.name?.charAt(0) || 'A')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                                    {isInstitutionAdmin && user?.institutionData?.name ? user.institutionData.name : (user?.name || 'Admin User')}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">
                                    {isSystemAdmin ? 'System Administrator' : 'Institution Admin'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-slate-100 text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all group"
                        >
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
