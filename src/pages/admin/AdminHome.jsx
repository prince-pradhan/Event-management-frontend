import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, authApi } from '../../api/endpoints';
import { ROUTES } from '../../utils/constants';
import Card from '../../components/common/Card';

export default function AdminHome() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [eventsRes, usersRes] = await Promise.all([
                    eventsApi.getAll(),
                    authApi.getUsers()
                ]);

                if (eventsRes.data.success && usersRes.data.success) {
                    const events = eventsRes.data.events || [];
                    const users = usersRes.data.users || [];

                    setStats({
                        totalEvents: eventsRes.data.pagination?.total || events.length,
                        totalUsers: users.length
                    });
                }
            } catch (err) {
                console.error('Stats fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="page-heading text-slate-900">Admin Dashboard</h1>
                <p className="mt-2 text-slate-600">Quick overview of your campus event ecosystem.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {metrics.map((stat, idx) => (
                    <Card key={idx} className="shadow-soft border-slate-100 flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">
                                {loading ? '...' : stat.value}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to={ROUTES.ADMIN_EVENTS}>
                        <Card hover className="h-full shadow-soft border-slate-100 group">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-2xl group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    📋
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Event Inventory</h3>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        Monitor and coordinate all campus events. Publish, update, or cancel entries.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                    <Link to="/admin/users">
                        <Card hover className="h-full shadow-soft border-slate-100 group">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    👥
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">User Directory</h3>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                        Review registered students and administrators. Check verification statuses.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </section>


        </div>
    );
}
