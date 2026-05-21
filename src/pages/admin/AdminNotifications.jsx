import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { notificationApi, eventsApi, authApi } from '../../api/endpoints';
import { NOTIFICATION_CATEGORY, NOTIFICATION_SCOPE, USER_ROLE } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminNotifications() {
  const { user, isInstitutionAdmin, isSystemAdmin } = useAuth();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: NOTIFICATION_CATEGORY.SYSTEM,
    scope: NOTIFICATION_SCOPE.BROADCAST,
    recipientId: '',
    userIds: [],
    data: {
      eventId: '',
      action: '',
      externalLink: ''
    }
  });
  // When set, the form edits this notification instead of creating a new one.
  const [editingId, setEditingId] = useState(null);

  const categories = useMemo(() => [
    { value: NOTIFICATION_CATEGORY.NEW_EVENT, label: 'New Event' },
    { value: NOTIFICATION_CATEGORY.EVENT_REMINDER, label: 'Event Reminder' },
    { value: NOTIFICATION_CATEGORY.EVENT_UPDATED, label: 'Event Updated' },
    { value: NOTIFICATION_CATEGORY.SYSTEM, label: 'System' },
  ], []);

  const scopes = useMemo(() => [
    { value: NOTIFICATION_SCOPE.BROADCAST, label: 'Broadcast' },
    { value: NOTIFICATION_SCOPE.TARGETED, label: 'Targeted' },
    { value: NOTIFICATION_SCOPE.PERSONALIZED, label: 'Personalized' },
  ], []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const eventsPromise = isInstitutionAdmin && user?.institution
          ? eventsApi.getByInstitution(user.institution, { limit: 50, status: 'PUBLISHED' })
          : eventsApi.getAll({ limit: 50, status: 'PUBLISHED' });

        const [usersRes, eventsRes, listRes] = await Promise.allSettled([
          isSystemAdmin ? authApi.getUsers() : Promise.resolve({ data: { success: true, users: [] } }),
          eventsPromise,
          notificationApi.getAll({ page: 1, limit }),
        ]);

        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data?.users || []);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.events || []);
        if (listRes.status === 'fulfilled') {
          setList(listRes.value.data?.notifications || []);
          setTotal(listRes.value.data?.pagination?.total || 0);
        }
      } catch (e) {
        console.error('Bootstrap error:', e);
      }
    }
    bootstrap();
  }, [limit]);

  const fetchList = async (p = 1) => {
    const res = await notificationApi.getAll({ page: p, limit });
    if (res.data?.success) {
      setList(res.data.notifications || []);
      setTotal(res.data.pagination?.total || 0);
      setPage(p);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      category: NOTIFICATION_CATEGORY.SYSTEM,
      scope: NOTIFICATION_SCOPE.BROADCAST,
      recipientId: '',
      userIds: [],
      data: { eventId: '', action: '', externalLink: '' },
    });
    setEditingId(null);
  };

  const startEdit = (n) => {
    setEditingId(n._id);
    setForm({
      title: n.title || '',
      message: n.message || '',
      category: n.category || NOTIFICATION_CATEGORY.SYSTEM,
      scope: n.scope || NOTIFICATION_SCOPE.BROADCAST,
      recipientId: n.recipient?._id || n.recipient || '',
      userIds: Array.isArray(n.allowedUsers) ? n.allowedUsers.map(u => u._id || u) : [],
      data: {
        eventId: n.data?.eventId?._id || n.data?.eventId || '',
        action: n.data?.action || '',
        externalLink: n.data?.externalLink || '',
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete notification?',
      message: 'This will permanently delete the notification and remove it for all recipients.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await notificationApi.delete(id);
      if (res.data?.success) {
        addToast({ type: 'success', title: 'Deleted', message: 'Notification removed.' });
        if (editingId === id) resetForm();
        const nextPage = list.length === 1 && page > 1 ? page - 1 : page;
        await fetchList(nextPage);
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed', message: error?.response?.data?.message || 'Could not delete notification.' });
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onDataChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, data: { ...prev.data, [name]: value } }));
  };

  const toggleUserId = (id) => {
    setForm((prev) => {
      const exists = prev.userIds.includes(id);
      return { ...prev, userIds: exists ? prev.userIds.filter(u => u !== id) : [...prev.userIds, id] };
    });
  };

  const canSubmit = () => {
    if (!form.title.trim() || !form.message.trim()) return false;
    if (form.scope === NOTIFICATION_SCOPE.TARGETED && !form.recipientId) return false;
    if (form.scope === NOTIFICATION_SCOPE.PERSONALIZED && form.userIds.length === 0) return false;
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit()) {
      addToast({ type: 'warning', title: 'Missing fields', message: 'Please fill required fields for the chosen scope.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        scope: form.scope,
        data: {},
      };
      if (form.data.action) payload.data.action = form.data.action;
      if (form.data.externalLink) payload.data.externalLink = form.data.externalLink;
      if (form.data.eventId) payload.data.eventId = form.data.eventId;
      if (form.scope === NOTIFICATION_SCOPE.TARGETED) payload.recipientId = form.recipientId;
      if (form.scope === NOTIFICATION_SCOPE.PERSONALIZED) payload.userIds = form.userIds;

      const res = editingId
        ? await notificationApi.update(editingId, payload)
        : await notificationApi.create(payload);
      if (res.data?.success) {
        addToast({
          type: 'success',
          title: editingId ? 'Notification updated' : 'Notification sent',
          message: editingId
            ? 'Your changes have been saved.'
            : 'Your notification has been created and dispatched.',
        });
        const refreshPage = editingId ? page : 1;
        resetForm();
        // Refresh list separately; do not fail the whole flow if this errors
        try {
          await fetchList(refreshPage);
        } catch {
          // no-op
        }
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed',
        message: error?.response?.data?.message
          || (editingId ? 'Could not update notification.' : 'Could not create notification.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="container-app py-8 space-y-8">
      <div>
        <h1 className="page-heading">Notifications</h1>
        <p className="text-slate-600">Create and send notifications to users.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-6">
          {editingId && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
              <span>✏️ Editing an existing notification — only its content is updated, not the original recipients.</span>
              <button type="button" onClick={resetForm} className="text-xs font-bold underline whitespace-nowrap">
                Cancel
              </button>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                placeholder="e.g., New Workshop Announced"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              placeholder="Write the content of your notification..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Scope</label>
              <select
                name="scope"
                value={form.scope}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm(prev => ({ ...prev, scope: v, recipientId: '', userIds: [] }));
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white"
              >
                {scopes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {form.scope === NOTIFICATION_SCOPE.TARGETED && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Recipient</label>
                <select
                  name="recipientId"
                  value={form.recipientId}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white"
                >
                  <option value="">Select user</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}

            {form.scope === NOTIFICATION_SCOPE.PERSONALIZED && (
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Recipients</label>
                <div className="max-h-44 overflow-auto rounded-xl border border-slate-200 p-3 bg-white grid grid-cols-1 md:grid-cols-2 gap-2">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.userIds.includes(u._id)}
                        onChange={() => toggleUserId(u._id)}
                      />
                      <span>{u.name} <span className="text-slate-400">({u.email})</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Action</label>
              <input
                name="action"
                value={form.data.action}
                onChange={onDataChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
                placeholder="e.g., OPEN_EVENT"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Linkage</label>
              <select
                name="eventId"
                value={form.data.eventId}
                onChange={onDataChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white"
              >
                <option value="">None</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">External Link</label>
              <input
                name="externalLink"
                value={form.data.externalLink}
                onChange={onDataChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm} disabled={loading}>
                Cancel Edit
              </Button>
            )}
            <Button
              type="submit"
              disabled={!canSubmit() || loading}
              className="px-6"
            >
              {loading ? 'Saving...' : editingId ? 'Update Notification' : 'Send Notification'}
            </Button>
          </div>
        </form>
      </Card>

      <Card padding={false} className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent Notifications</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchList(Math.max(1, page - 1))}
              disabled={page <= 1}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${page <= 1 ? 'text-slate-300 border-slate-100' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              Prev
            </button>
            <span className="text-xs font-bold text-slate-500">Page {page} / {totalPages}</span>
            <button
              onClick={() => fetchList(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${page >= totalPages ? 'text-slate-300 border-slate-100' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              Next
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {list.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No notifications found</div>
          ) : (
            list.map(n => (
              <div key={n._id} className="p-5 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-800">{n.title}</h4>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">{n.message}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {n.category}
                    </span>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {n.scope}
                    </span>
                    {n.data?.eventId && (
                      <span className="text-[10px] font-bold text-primary-600">Event linked</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(n)}
                    title="Edit notification"
                    className={`p-2 rounded-xl transition-all ${editingId === n._id ? 'text-primary-600 bg-primary-50' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(n._id)}
                    title="Delete notification"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
