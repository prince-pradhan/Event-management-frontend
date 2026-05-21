import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { eventsApi, reviewApi, registrationsApi } from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { EVENT_STATUS, ROUTES, USER_ROLE } from '../../../utils/constants';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag, 
  ArrowLeft, 
  Edit, 
  MessageSquare, 
  UserCheck,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function AdminEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSystemAdmin } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    console.log('Fetching event data for ID:', id);
    if (!id) return;
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const [eventRes, regRes] = await Promise.all([
          eventsApi.getById(id),
          registrationsApi.getByEvent(id)
        ]);
        console.log('Event data response:', eventRes.data);
        console.log('Registrations data response:', regRes.data);

        if (eventRes.data?.success) {
          setEvent(eventRes.data.event);
        } else {
          setError('Event not found');
        }

        if (regRes.data?.success) {
          // Count only confirmed attendees, not pending/cancelled/failed registrations.
          const regs = regRes.data.registrations || [];
          setAttendeeCount(regs.filter((r) => r.status === 'REGISTERED').length);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const getAdminPath = (path) => {
    const prefix = isSystemAdmin ? '/admin' : '/institution-admin';
    return path.replace('/admin', prefix);
  };

  if (loading) {
    return (
      <div className="container-app py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="text-2xl font-black text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-500">The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to={getAdminPath(ROUTES.ADMIN_EVENTS)} className="mt-6 inline-block">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';
  const startDate = formatDateTime(event.startDate);
  const endDate = formatDateTime(event.endDate);
  const bannerUrl =
    typeof event.bannerImage === 'string' ? event.bannerImage : event.bannerImage?.url;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <Link 
            to={getAdminPath(ROUTES.ADMIN_EVENTS)} 
            className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{event.title}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              event.status === EVENT_STATUS.PUBLISHED ? 'bg-emerald-100 text-emerald-700' : 
              event.status === EVENT_STATUS.DRAFT ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
            }`}>
              {event.status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => navigate(getAdminPath(ROUTES.ADMIN_EVENT_EDIT.replace(':id', event._id)))}
          >
            <Edit className="w-4 h-4" /> Edit Event
          </Button>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={() => navigate(getAdminPath(ROUTES.ADMIN_EVENT_REGISTRATIONS.replace(':id', event._id)))}
          >
            <UserCheck className="w-4 h-4" /> View Attendees
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-100">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Calendar className="w-20 h-20" />
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-white/20">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Price</p>
              <p className="text-lg font-black text-primary-600">{event.isFree ? 'FREE' : `$${event.price}`}</p>
            </div>
          </div>

          {/* Description */}
          <Card className="p-8 border-0 shadow-soft-xl">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-600" />
              About this Event
            </h3>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>
          </Card>

          {/* Additional Info */}
          {event.registrationFields && event.registrationFields.length > 0 && (
            <Card className="p-8 border-0 shadow-soft-xl">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-600" />
                Custom Registration Fields
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.registrationFields.map((field, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{field.label}</p>
                    <p className="text-sm font-bold text-slate-700">{field.fieldType} {field.required ? '(Required)' : '(Optional)'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <Card className="p-6 border-0 shadow-soft-xl bg-slate-900 text-white overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-400">Event Pulse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-black">{attendeeCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendees</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black">{event.availableSeats}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats Left</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full transition-all duration-1000"
                  style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }}
                />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl" />
          </Card>

          {/* Details */}
          <Card className="p-6 border-0 shadow-soft-xl space-y-6">
            <h3 className="text-lg font-black text-slate-900">Logistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Starts</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{startDate}</p>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-3">Ends</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{endDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {typeof event.location === 'object' 
                      ? `${event.location.venue || ''} ${event.location.address || ''} ${event.location.city || ''}`.trim() || 'Online / TBD'
                      : event.location || 'Online / TBD'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{event.category?.name || 'Uncategorized'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Institution</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">
                    {typeof event.institution === 'object' ? (event.institution?.name || '—') : 'All Institutions'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button 
              onClick={() => navigate(getAdminPath(ROUTES.ADMIN_EVENT_REVIEWS.replace(':id', event._id)))}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-primary-700 transition-colors">Manage Reviews</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
