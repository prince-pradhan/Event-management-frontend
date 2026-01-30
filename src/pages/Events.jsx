import { useState, useEffect } from 'react';
import { eventsApi, categoriesApi } from '../api/endpoints';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';

/**
 * Backend: GET /api/events?category,status,search,page,limit
 * Response: { success, events, pagination: { page, limit, total } }
 */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', status: '', page: 1, limit: 20 });

  useEffect(() => {
    categoriesApi.getAll().then((res) => {
      if (res.data?.success && res.data?.categories) setCategories(res.data.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
    };
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;

    eventsApi
      .getAll(params)
      .then((res) => {
        if (res.data?.success) {
          setEvents(res.data.events || []);
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0 });
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filters.search, filters.category, filters.status, filters.page, filters.limit]);

  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 20)) || 1;

  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="page-heading text-slate-900">All events</h1>
        <p className="mt-1 text-slate-600">Seminars, workshops, festivals, and more</p>
      </div>
      <EventFilters filters={filters} onFilterChange={setFilters} categories={categories} />
      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="mt-10 text-center py-12 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-slate-600">No events found.</p>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          {pagination.total > (pagination.limit || 20) && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="px-4 py-2 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="px-4 py-2 rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
