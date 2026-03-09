import { useState, useMemo } from 'react';
import { Bell, Check, Trash2, Calendar, Info, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_CATEGORY } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { notifications, loading, markAsRead, deleteNotification, unreadCount, pagination, fetchNotifications, loadMore } = useNotifications();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [category, setCategory] = useState('ALL');

  const getIcon = (category) => {
    switch (category) {
      case NOTIFICATION_CATEGORY.NEW_EVENT:
        return <Calendar className="w-5 h-5 text-emerald-500" />;
      case NOTIFICATION_CATEGORY.EVENT_UPDATED:
        return <Info className="w-5 h-5 text-blue-500" />;
      case NOTIFICATION_CATEGORY.SYSTEM:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  const categories = useMemo(() => ([
    { value: 'ALL', label: 'All' },
    { value: NOTIFICATION_CATEGORY.NEW_EVENT, label: 'New Events' },
    { value: NOTIFICATION_CATEGORY.EVENT_REMINDER, label: 'Reminders' },
    { value: NOTIFICATION_CATEGORY.EVENT_UPDATED, label: 'Updates' },
    { value: NOTIFICATION_CATEGORY.SYSTEM, label: 'System' },
  ]), []);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (unreadOnly && n.read) return false;
      if (category !== 'ALL' && n.category !== category) return false;
      return true;
    });
  }, [notifications, unreadOnly, category]);

  const onRefresh = async () => {
    await fetchNotifications({ page: 1, limit: pagination.limit, unreadOnly, append: false });
  };

  return (
    <div className="container-app py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading text-slate-900 mb-1">Notifications</h1>
          <p className="text-slate-600">Stay updated with event reminders and campus alerts</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <div className="px-4 py-2 bg-primary-50 text-primary-700 rounded-2xl border border-primary-100 text-sm font-bold flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
              {unreadCount} UNREAD
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Show</span>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => { setUnreadOnly(e.target.checked); onRefresh(); }}
                className="rounded border-slate-300"
              />
              Unread only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); }}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
            >
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Button size="sm" variant="secondary" onClick={onRefresh} className="py-1.5 h-auto text-[11px] font-black tracking-widest uppercase">
            Refresh
          </Button>
        </div>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft-lg border border-slate-100/50 bg-white">
        <div className="divide-y divide-slate-100">
          {loading && filtered.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing your alerts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Bell className="w-8 h-8" />
              </div>
              <p className="text-slate-800 font-black text-xl mb-1">No alerts found</p>
              <p className="text-slate-500 font-medium">We'll notify you here when something important happens.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n._id}
                className={`p-6 flex gap-5 transition-all relative group ${!n.read ? 'bg-primary-50/20' : 'hover:bg-slate-50/50'}`}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600"></div>
                )}
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 ${!n.read ? 'bg-white' : 'bg-slate-50'}`}>
                    {getIcon(n.category)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className={`text-lg font-bold leading-tight ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4 max-w-2xl">{n.message}</p>

                  <div className="flex flex-wrap items-center gap-4">
                    {n.data?.eventId && (
                      <Link
                        to={`/events/${typeof n.data.eventId === 'object' ? n.data.eventId._id : n.data.eventId}`}
                        className="inline-flex items-center text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors"
                      >
                        Explore Event <ExternalLink className="w-3 h-3 ml-1.5" />
                      </Link>
                    )}
                    <Link
                      to={`/student/notifications/${n._id}`}
                      className="inline-flex items-center text-xs font-black text-slate-600 hover:text-slate-800 uppercase tracking-widest transition-colors"
                    >
                      Read More <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Link>

                    <div className="flex items-center gap-2 ml-auto">
                      {!n.read && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markAsRead(n._id)}
                          className="py-1.5 px-3 h-auto text-[10px] font-black tracking-widest uppercase border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        >
                          <Check className="w-3 h-3 mr-1.5" /> Mark Read
                        </Button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {filtered.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
            {pagination.hasMore ? (
              <Button
                variant="secondary"
                onClick={() => loadMore({ unreadOnly })}
                disabled={loading}
                className="py-2 h-auto text-[11px] font-black tracking-widest uppercase"
              >
                Load more
              </Button>
            ) : (
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                End of notifications
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
