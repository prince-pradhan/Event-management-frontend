import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { notificationApi } from '../../api/endpoints';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Bell, Calendar, Info, AlertTriangle, ArrowLeft, Check, Trash2 } from 'lucide-react';
import { NOTIFICATION_CATEGORY, ROUTES } from '../../utils/constants';

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function fetchOne() {
      setLoading(true);
      setError('');
      try {
        const res = await notificationApi.getById(id);
        if (mounted && res.data?.success) {
          setData(res.data.notification);
        }
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Failed to load notification');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchOne();
    return () => { mounted = false; };
  }, [id]);

  const getIcon = (category) => {
    switch (category) {
      case NOTIFICATION_CATEGORY.NEW_EVENT: return <Calendar className="w-5 h-5 text-emerald-500" />;
      case NOTIFICATION_CATEGORY.EVENT_UPDATED: return <Info className="w-5 h-5 text-blue-500" />;
      case NOTIFICATION_CATEGORY.SYSTEM: return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const onMarkRead = async () => {
    if (data?.read) return;
    await markAsRead(id);
    setData(prev => prev ? { ...prev, read: true } : prev);
  };

  const onDelete = async () => {
    await deleteNotification(id);
    navigate(ROUTES.STUDENT_NOTIFICATIONS);
  };

  return (
    <div className="container-app py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link to={ROUTES.STUDENT_NOTIFICATIONS} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Notifications
        </Link>
      </div>

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
        ) : !data ? (
          <div className="p-10 text-center text-slate-500">Notification not found</div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 bg-white">
                  {getIcon(data.category)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{data.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {data.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!data.read && (
                  <Button size="sm" variant="secondary" onClick={onMarkRead} className="py-1.5 h-auto text-[11px] font-black tracking-widest uppercase">
                    <Check className="w-3 h-3 mr-1.5" /> Mark Read
                  </Button>
                )}
                <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{data.message}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                {data.data?.eventId && (
                  <Link
                    to={`/events/${typeof data.data.eventId === 'object' ? data.data.eventId._id : data.data.eventId}`}
                    className="inline-flex items-center text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest"
                  >
                    View Event <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Link>
                )}
                {data.data?.externalLink && (
                  <a
                    href={data.data.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest"
                  >
                    Open Link <ExternalLink className="w-3 h-3 ml-1.5" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
