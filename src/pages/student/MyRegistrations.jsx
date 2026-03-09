import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES } from '../../utils/constants';
import { registrationsApi } from '../../api/endpoints';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await registrationsApi.getMyRegistrations();
        if (response.data.success) {
          setRegistrations(response.data.registrations);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    if (filter === 'all') return registrations;
    
    const now = new Date();
    
    return registrations.filter(reg => {
      const eventDate = new Date(reg.event?.startDate);
      const regStatus = reg.status || 'CONFIRMED'; 
      const eventStatus = reg.event?.status || 'PUBLISHED';
      
      const isCancelled = regStatus === 'CANCELLED' || eventStatus === 'CANCELLED';

      if (filter === 'cancelled') return isCancelled;
      if (isCancelled) return false; // Don't show cancelled in other tabs
      
      if (filter === 'upcoming') return eventDate >= now;
      if (filter === 'completed') return eventDate < now;
      
      return true;
    });
  }, [registrations, filter]);

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) : '—';
  };

  const formatTime = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Registrations</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your tickets and upcoming events</p>
        </div>
        <div className="flex gap-3">
          <Link to={ROUTES.EVENTS}>
            <button className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <Search className="w-4 h-4" />
              Find More Events
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">Total Events</p>
          <p className="text-3xl font-black text-indigo-900">{registrations.length}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">Confirmed</p>
          <p className="text-3xl font-black text-emerald-900">
            {registrations.filter(r => r.status !== 'CANCELLED' && r.event?.status !== 'CANCELLED').length}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">Upcoming</p>
          <p className="text-3xl font-black text-amber-900">
            {registrations.filter(r => new Date(r.event?.startDate) >= new Date() && r.status !== 'CANCELLED' && r.event?.status !== 'CANCELLED').length}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Completed</p>
          <p className="text-3xl font-black text-slate-700">
            {registrations.filter(r => new Date(r.event?.startDate) < new Date() && r.status !== 'CANCELLED' && r.event?.status !== 'CANCELLED').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
              filter === tab 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading your tickets...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No registrations found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">
              {filter === 'all' 
                ? "You haven't signed up for any events yet." 
                : `You don't have any ${filter} events.`}
            </p>
            <Link to={ROUTES.EVENTS}>
              <Button size="lg" className="shadow-lg shadow-primary-900/20">
                Explore Events
              </Button>
            </Link>
          </div>
        ) : (
          filteredRegistrations.map((reg, index) => (
            <motion.div
              key={reg._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Date Badge */}
                <div className="flex-shrink-0 flex md:flex-col items-center justify-center w-full md:w-20 h-16 md:h-20 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors gap-2 md:gap-0">
                  <span className="text-sm font-bold text-slate-500 uppercase group-hover:text-primary-600">
                    {new Date(reg.event?.startDate).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-black text-slate-900 group-hover:text-primary-700">
                    {new Date(reg.event?.startDate).getDate()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {reg.status === 'CANCELLED' ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Ticket Cancelled
                      </span>
                    ) : reg.event?.status === 'CANCELLED' ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Event Cancelled
                      </span>
                    ) : new Date(reg.event?.startDate) < new Date() ? (
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Completed
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Confirmed
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-400">
                      ID: #{reg._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                    {reg.event?.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {formatTime(reg.event?.startDate)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {reg.event?.location?.venue}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex md:flex-col gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                  <Link to={`${ROUTES.EVENTS}/${reg.event?._id}`} className="flex-1">
                    <button className="w-full whitespace-nowrap px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      View Details
                    </button>
                  </Link>
                  {reg.status !== 'CANCELLED' && reg.event?.status !== 'CANCELLED' && new Date(reg.event?.startDate) >= new Date() && (
                    <button className="w-full whitespace-nowrap px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Ticket
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
