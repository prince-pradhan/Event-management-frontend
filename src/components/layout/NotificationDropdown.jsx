import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Calendar, Info, AlertTriangle, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_CATEGORY } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, deleteNotification, loading, markAllAsRead } = useNotifications();
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (category) => {
        switch (category) {
            case NOTIFICATION_CATEGORY.NEW_EVENT:
                return <Calendar className="w-4 h-4 text-emerald-500" />;
            case NOTIFICATION_CATEGORY.EVENT_UPDATED:
                return <Info className="w-4 h-4 text-blue-500" />;
            case NOTIFICATION_CATEGORY.SYSTEM:
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            default:
                return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <div className="mb-2 flex justify-center">
                                    <Bell className="w-8 h-8 text-slate-200" />
                                </div>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n._id}
                                        className={`p-4 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                                    {getIcon(n.category)}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className={`text-sm font-semibold truncate pr-6 ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {n.title}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-slate-600 line-clamp-2 mb-1.5">{n.message}</p>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] text-slate-400 font-medium">
                                                        {formatDate(n.createdAt)}
                                                    </span>

                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.read && (
                                                            <button
                                                                onClick={() => markAsRead(n._id)}
                                                                className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotification(n._id)}
                                                            className="p-1 hover:bg-red-100 text-red-500 rounded-md transition-colors"
                                                            title="Delete"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {n.data?.eventId && (
                                                    <Link
                                                        to={`/events/${typeof n.data.eventId === 'object' ? n.data.eventId._id : n.data.eventId}`}
                                                        onClick={() => setIsOpen(false)}
                                                        className="mt-2 inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
                                                    >
                                                        View Event
                                                        <ExternalLink className="w-3 h-3 ml-1" />
                                                    </Link>
                                                )}
                                                <Link
                                                    to={`/student/notifications/${n._id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="mt-2 ml-4 inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-800"
                                                >
                                                    View Details
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                            onClick={() => markAllAsRead()}
                            disabled={unreadCount === 0}
                            className={`text-xs font-semibold transition-colors ${unreadCount === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-primary-600'}`}
                        >
                            Mark all as read
                        </button>
                        <Link
                            to="/student/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                            View all
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
