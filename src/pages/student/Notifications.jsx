import Card from '../../components/common/Card';
import { NOTIFICATION_TYPE } from '../../utils/constants';

/**
 * Backend Notification model: user (ref), event (ref), type (EMAIL|SMS|PUSH),
 * title, message, isRead, scheduledAt, timestamps
 * Static data mirrors this until notification API is ready.
 */
const STATIC_NOTIFICATIONS = [
  {
    _id: '1',
    title: 'Reminder: Tech Workshop tomorrow',
    message: 'Your registered event "Intro to Web Dev" is on Jan 15 at 10:00 AM.',
    type: NOTIFICATION_TYPE.PUSH,
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '2',
    title: 'New event: Annual Festival',
    message: 'Registrations are open for the Annual College Festival, Feb 20–22.',
    type: NOTIFICATION_TYPE.EMAIL,
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    _id: '3',
    title: 'Booking confirmed',
    message: 'Your registration for "Career Seminar" has been confirmed.',
    type: NOTIFICATION_TYPE.EMAIL,
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
];

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return 'Just now';
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
  return d.toLocaleDateString();
}

export default function Notifications() {
  return (
    <div className="container-app py-10">
      <h1 className="page-heading text-slate-900 mb-2">Notifications</h1>
      <p className="text-slate-600 mb-8">Event reminders and updates (Notification model)</p>

      <Card padding={false} className="overflow-hidden shadow-soft">
        <div className="divide-y divide-slate-100">
          {STATIC_NOTIFICATIONS.map((n) => (
            <div
              key={n._id}
              className={`p-6 flex gap-4 ${!n.isRead ? 'bg-primary-50/40' : ''} hover:bg-slate-50/50 transition-colors`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                {n.type === NOTIFICATION_TYPE.EMAIL ? '✉' : n.type === NOTIFICATION_TYPE.SMS ? '📱' : '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{n.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                <p className="text-xs text-slate-400 mt-2">{timeAgo(n.createdAt)} · {n.type}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500 italic">
            Static data matching backend Notification model. Real notifications will load when the API is connected.
          </p>
        </div>
      </Card>
    </div>
  );
}
