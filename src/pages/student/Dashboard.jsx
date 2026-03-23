import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Ticket, 
  Settings, 
  ArrowRight, 
  Clock, 
  MapPin,
  ChevronRight,
  User,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import VerificationBanner from '../../components/common/VerificationBanner';
import { ROUTES, USER_ROLE } from '../../utils/constants';
import { eventsApi, registrationsApi } from '../../api/endpoints';

export default function StudentDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [teaserUpcoming, setTeaserUpcoming] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(
    localStorage.getItem('verificationBannerDismissed') === 'true'
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, regsRes, upcomingRes] = await Promise.all([
          eventsApi.getAll({ status: 'PUBLISHED', limit: 4 }), // Only published for recommendation
          registrationsApi.getMyRegistrations(),
          eventsApi.getAll({ status: 'UPCOMING', limit: 3, page: 1 })
        ]);

        if (eventsRes.data.success) {
          setUpcomingEvents(eventsRes.data.events);
          setTotalAvailable(eventsRes.data.pagination?.total || 0);
        }
        if (regsRes.data.success) {
          setMyRegistrations(regsRes.data.registrations);
        }
        if (upcomingRes.data?.success) {
          setTeaserUpcoming(upcomingRes.data.events || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('verificationBannerDismissed', 'true');
  };

  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.event?._id === eventId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container-app py-8 lg:py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Manage your schedule and discover new experiences.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            
           {/* <Link to={ROUTES.STUDENT_PROFILE}>
             <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors">
               <User className="w-4 h-4" />
               Profile
             </button>
           </Link>
           <button 
             onClick={logout}
             className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
           >
             <LogOut className="w-4 h-4" />
             Sign Out
           </button> */}
        </div>
      </div>

      {/* Upcoming Teaser Strip */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 tracking-widest uppercase">Upcoming</h3>
          </div>
          <Link to={`${ROUTES.EVENTS}?status=UPCOMING`} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {loading && teaserUpcoming.length === 0 ? (
            [1,2,3].map(i => <div key={i} className="min-w-[220px] h-16 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />)
          ) : teaserUpcoming.length === 0 ? (
            <div className="text-xs text-slate-500 font-medium px-2 py-1">No upcoming events</div>
          ) : (
            teaserUpcoming.map(ev => {
              const date = new Date(ev.startDate);
              const dd = date.getDate();
              const mm = date.toLocaleString('default', { month: 'short' });
              return (
                <Link to={`${ROUTES.EVENTS}/${ev._id}`} key={ev._id} className="min-w-[240px]">
                  <div className="h-full bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 px-4 py-3 hover:border-primary-100 hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-900">
                      <span className="text-[10px] font-bold uppercase">{mm}</span>
                      <span className="text-lg font-black leading-none">{dd}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ev.title}</p>
                      <p className="text-xs text-slate-500 truncate">{ev.location?.venue || 'TBA'}</p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {user && !user.isVerified && !bannerDismissed && (
        <VerificationBanner onDismiss={handleDismissBanner} />
      )}

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left Column: Events & Tickets (8 columns) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardStatCard 
              to={ROUTES.STUDENT_MY_REGISTRATIONS}
              icon={<Ticket className="w-6 h-6 text-white" />}
              value={myRegistrations.length}
              label="Active Tickets"
              bgClass="bg-gradient-to-br from-primary-600 to-primary-700"
              textClass="text-white"
            />
            <DashboardStatCard 
              to={ROUTES.EVENTS}
              icon={<Calendar className="w-6 h-6 text-primary-600" />}
              value={totalAvailable}
              label="Events Available"
              bgClass="bg-white border border-slate-200"
              textClass="text-slate-900"
            />
            <DashboardStatCard
              to={ROUTES.STUDENT_CALENDAR}
              icon={<Calendar className="w-6 h-6 text-primary-600" />}
              value={myRegistrations.length}
              label="My Calendar"
              bgClass="bg-white border border-slate-200"
              textClass="text-slate-900"
            />
          </div>

          {/* Become an Institution Call-to-Action */}
          {user?.role === USER_ROLE.STUDENT && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-0 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 className="w-32 h-32 text-white -rotate-12 translate-x-10 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 p-4">
                  <div className="max-w-md">
                    <h3 className="text-2xl font-black text-white mb-2">Represent an Institution?</h3>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      Register your college or organization to start hosting your own campus events and manage registrations effortlessly.
                    </p>
                  </div>
                  <Link to={ROUTES.INSTITUTION_APPLY}>
                    <Button className="bg-primary-500 hover:bg-primary-600 text-white border-0 shadow-lg shadow-primary-900/20 px-8 py-3">
                      Become an Institute <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Upcoming Events Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
              <Link to={ROUTES.EVENTS} className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View All Events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-5">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <motion.div 
                    key={event._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to={`${ROUTES.EVENTS}/${event._id}`} className="block group">
                      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden">
                        
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-900 border border-slate-200 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                          <span className="text-xs font-bold uppercase tracking-wider">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-2xl font-black">{new Date(event.startDate).getDate()}</span>
                        </div>
                        
                        <div className="flex-grow min-w-0 z-10">
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors mb-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {event.location?.venue || 'TBA'}
                            </span>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex-shrink-0 self-start sm:self-center z-10">
                           {isRegistered(event._id) ? (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
                              Going
                            </span>
                           ) : (
                             <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all">
                               <ArrowRight className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                             </div>
                           )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No upcoming events found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity (4 columns) */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
               {/* Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50 -z-10" />

              {myRegistrations.length > 0 ? (
                <div className="space-y-8 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />
                  
                  {myRegistrations.slice(0, 4).map((reg) => (
                    <div key={reg._id} className="relative flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Registered for <span className="text-primary-600">{reg.event?.title}</span>
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          {new Date(reg.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Link to={ROUTES.STUDENT_MY_REGISTRATIONS} className="block pt-2">
                    <button className="w-full py-3 text-sm font-bold text-slate-600 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-xl transition-colors">
                      View Full History
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No recent activity</p>
                  <p className="text-xs text-slate-500 mt-1">Your actions will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DashboardStatCard({ to, icon, value, label, bgClass, textClass }) {
  return (
    <Link to={to} className="block group">
      <div className={`p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 h-full ${bgClass}`}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${bgClass === 'bg-white border border-slate-200' ? 'bg-slate-50' : 'bg-white/20'}`}>
              {icon}
            </div>
            {bgClass.includes('white') ? (
               <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
               </div>
            ) : (
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-primary-600 transition-all">
                  <ArrowRight className="w-4 h-4 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
               </div>
            )}
          </div>
          <div>
            <h3 className={`text-4xl font-black mb-1 ${textClass}`}>{value}</h3>
            <p className={`text-sm font-bold opacity-80 ${textClass}`}>{label}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
