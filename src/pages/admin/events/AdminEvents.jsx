import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ROUTES, USER_ROLE } from '../../../utils/constants';
import { useAdminEvents } from '../../../hooks/useAdminEvents';
import StatusDropdown from './components/StatusDropdown';
import { useAuth } from '../../../context/AuthContext';
import { institutionsApi } from '../../../api/endpoints/institutions';
import { categoriesApi } from '../../../api/endpoints/categories';
import { Search, Filter, Calendar as CalendarIcon, Tag, Globe, CheckCircle2, XCircle } from 'lucide-react';

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function AdminEvents() {
  const { user, isSystemAdmin } = useAuth();
  const navigate = useNavigate();
  
  // If the user is an institution admin, only fetch events for their institution.
  // System admins will fetch all events (institutionId = undefined).
  const institutionId = user?.role === USER_ROLE.INSTITUTION_ADMIN ? user.institution : undefined;
  
  const { events, loading, error, deleteEvent, updateEventStatus } = useAdminEvents(institutionId);

  const [institutionNameById, setInstitutionNameById] = useState({});
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedPriceType, setSelectedPriceType] = useState('all'); // all, free, paid

  // For institution-admin, we already have their institution name in auth context.
  const singleInstitutionName = !isSystemAdmin ? user?.institutionData?.name : null;

  useEffect(() => {
    // Fetch categories for filter
    categoriesApi.getAll().then(res => {
      if (res.data.success) setCategories(res.data.categories);
    }).catch(err => console.error('Failed to fetch categories', err));

    // Fetch institutions for system admin filter
    if (isSystemAdmin) {
      institutionsApi.list('VERIFIED').then(res => {
        if (res.data.success) setInstitutions(res.data.institutions);
      }).catch(err => console.error('Failed to fetch institutions', err));
    }
  }, [isSystemAdmin]);

  useEffect(() => {
    if (!isSystemAdmin) return;
    if (!events?.length) return;

    const institutionIds = Array.from(
      new Set(
        events
          .map((e) => (e?.institution && typeof e.institution === 'string' ? e.institution : null))
          .filter(Boolean)
      )
    );

    if (institutionIds.length === 0) return;

    let mounted = true;

    async function loadInstitutionNames() {
      try {
        const missing = institutionIds.filter((id) => !institutionNameById[id]);
        if (missing.length === 0) return;

        const results = await Promise.all(
          missing.map((id) =>
            institutionsApi
              .getById(id)
              .then((r) => ({ id, name: r.data?.institution?.name || null }))
              .catch(() => ({ id, name: null }))
          )
        );

        if (!mounted) return;
        setInstitutionNameById((prev) => {
          const next = { ...prev };
          results.forEach(({ id, name }) => {
            next[id] = name;
          });
          return next;
        });
      } catch (e) {
        // Non-fatal: we can still render rows without institution name
        console.warn('Failed to load institution names for events:', e);
      }
    }

    loadInstitutionNames();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isSystemAdmin]);

  // Client-side filtering
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        (event.category?._id || event.category)?.toString() === selectedCategory;
      const matchesInstitution = !isSystemAdmin || selectedInstitution === 'all' || 
        (event.institution?._id || event.institution)?.toString() === selectedInstitution;
      const matchesPrice = selectedPriceType === 'all' || 
        (selectedPriceType === 'free' ? event.isFree : !event.isFree);
      
      return matchesSearch && matchesCategory && matchesInstitution && matchesPrice;
    });
  }, [events, searchTerm, selectedCategory, selectedInstitution, selectedPriceType, isSystemAdmin]);

  // Helper to resolve admin path based on role
  const getAdminPath = (path) => {
    const prefix = isSystemAdmin ? '/admin' : '/institution-admin';
    return path.replace('/admin', prefix);
  };

  if (loading) {
    return (
      <div className="container-app py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 font-medium">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 inline-block max-w-md">
          <p className="font-bold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm" variant="secondary">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link to={getAdminPath(ROUTES.ADMIN_DASHBOARD)} className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-block uppercase tracking-wider">
            ← Back to dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Event Management</h1>
          <p className="mt-1 text-slate-500 font-medium">Create, edit, and publish college events</p>
        </div>
        <Link to={getAdminPath(ROUTES.ADMIN_EVENTS_CREATE)}>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 px-8 py-3">
            + New Event
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <Card className="p-6 border-slate-100/50 shadow-soft-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 text-sm font-medium transition-all"
            />
          </div>

          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 text-sm font-bold text-slate-700 transition-all appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={selectedPriceType}
              onChange={(e) => setSelectedPriceType(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 text-sm font-bold text-slate-700 transition-all appearance-none"
            >
              <option value="all">Free & Paid</option>
              <option value="free">Free Events</option>
              <option value="paid">Paid Events</option>
            </select>
          </div>

          {isSystemAdmin && (
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-primary-500 focus:ring-0 text-sm font-bold text-slate-700 transition-all appearance-none"
              >
                <option value="all">All Institutions</option>
                {institutions.map(inst => (
                  <option key={inst._id} value={inst._id}>{inst.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      <Card padding={false} className="overflow-hidden shadow-soft-xl border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 uppercase tracking-[0.2em]">
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Event</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Category</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Type</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Attendance</th>
                {isSystemAdmin && <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Institution</th>}
                <th className="text-left px-6 py-5 text-[10px] font-black text-slate-400">Status</th>
                <th className="text-right px-6 py-5 text-[10px] font-black text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={isSystemAdmin ? "7" : "6"} className="px-6 py-16 text-center">
                    <div className="text-4xl mb-4 opacity-20">🔍</div>
                    <p className="text-slate-400 font-medium">No events match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={getAdminPath(`/admin/events/${event._id}`)}>
                        <p className="font-bold text-slate-800 hover:text-primary-600 transition-colors cursor-pointer">{event.title}</p>
                      </Link>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(event.startDate)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {event.isFree ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Free
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                          ${event.price}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (1 - (event.availableSeats / event.totalSeats)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 italic">
                          {event.totalSeats - event.availableSeats}/{event.totalSeats}
                        </span>
                      </div>
                    </td>
                    {isSystemAdmin && (
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                          {typeof event.institution === 'object' ? event.institution?.name : (institutionNameById[event.institution] || '—')}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <StatusDropdown
                        status={event.status}
                        onChange={(newStatus) => updateEventStatus(event._id, newStatus)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-5">
                        <Link
                          to={getAdminPath(`/admin/events/${event._id}`)}
                          className="text-[10px] font-black text-slate-300 hover:text-primary-600 uppercase tracking-widest transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          to={getAdminPath(ROUTES.ADMIN_EVENT_EDIT.replace(':id', event._id))}
                          className="text-[10px] font-black text-slate-300 hover:text-primary-600 uppercase tracking-widest transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


