import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users, Zap, Star } from 'lucide-react';
import { eventsApi } from '../../api/endpoints';
import { ROUTES } from '../../utils/constants';
import EventCard from '../../components/events/EventCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

// Assets
import heroImage from '../../assets/hero-campus.png';
import featureImage1 from '../../assets/students-hall.png';
import cubesPattern from '../../assets/cubes.png';
import galleryImg1 from '../../assets/Event1.png';
import galleryImg2 from '../../assets/event2.png';
import galleryImg3 from '../../assets/event4.png';
import galleryImg4 from '../../assets/graducation.png';
import galleryImg5 from '../../assets/crishtmas.png';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      const fetchEvents = async () => {
        try {
          // Fetch only events marked as UPCOMING by admin
          const response = await eventsApi.getAll({ status: 'UPCOMING', limit: 6, page: 1 });
          if (response.data.success) {
            setUpcomingEvents(response.data.events || []);
          }
        } catch (error) {
          console.error('Failed to fetch events', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }
  }, [isAuthenticated]);

  if (authLoading || isAuthenticated) {
    return <div className="min-h-screen bg-slate-50" />; // Or a loading spinner
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Campus Life" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="container-app relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span 
              variants={fadeInUp}
              className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold mb-6 border border-primary-500/30"
            >
              🚀 The Ultimate Campus Event Hub
            </motion.span>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
            >
              Discover. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Experience.</span> Connect.
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl"
            >
              Join thousands of students exploring the best workshops, festivals, and seminars on campus. Your next unforgettable moment starts here.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Link to={ROUTES.EVENTS}>
                <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-900/20 border-0">
                  Explore Events <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Join Our Community?</h2>
            <p className="text-lg text-slate-600">We make it effortless to discover and manage your campus life.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="w-8 h-8 text-primary-600" />}
              title="Seamless Booking"
              description="Register for events in seconds. No more long queues or paperwork."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-indigo-600" />}
              title="Vibrant Community"
              description="Connect with like-minded peers and grow your network on campus."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="Real-time Updates"
              description="Get instant notifications for event changes, reminders, and new announcements."
            />
          </div>
        </div>
      </section>

      {/* Visual Split Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src={featureImage1} alt="Students" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-50 z-[-1]" />
            </div>
            <div className="lg:w-1/2">
              <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Empowering Student Life</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We believe that campus life is more than just lectures. It's about the memories you create, the skills you learn, and the people you meet. Our platform bridges the gap between students and the vibrant events happening around them.
              </p>
              <ul className="space-y-4">
                {['Curated Workshops', 'Cultural Festivals', 'Tech Hackathons'].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / Past Events Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Memories & Highlights</h2>
            <p className="text-lg text-slate-600">A glimpse into the vibrant life on campus.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
              <img src={galleryImg1} alt="Event Highlight" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold text-lg">Tech Symposium 2024</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src={galleryImg5} alt="Christmas Celebration" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">Christmas</span>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src={galleryImg4} alt="Graduation" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-semibold">Graduation Day</span>
              </div>
            </div>
            <div className="col-span-2 relative rounded-2xl overflow-hidden group">
              <img src={galleryImg2} alt="Workshop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                 <span className="text-white font-bold">Talent Show</span>
              </div>
            </div>
            <div className="col-span-4 row-span-2 relative rounded-2xl overflow-hidden group">
              <img src={galleryImg3} alt="Event Highlight" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold text-lg">Cultural Program</span>
              </div>
            </div>          
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-24 bg-slate-50">
        <div className="container-app">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
              <p className="text-lg text-slate-600">Don't miss out on what's happening next.</p>
            </div>
            <Link to={`${ROUTES.EVENTS}?status=UPCOMING`} className="hidden md:inline-flex items-center font-bold text-primary-600 hover:text-primary-700 transition-colors">
              View Upcoming <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
             <div className="grid md:grid-cols-3 gap-8">
               {[1, 2, 3].map(n => (
                 <div key={n} className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
               ))}
             </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No upcoming events found right now.</p>
              <Link to={ROUTES.EVENTS} className="text-primary-600 font-bold mt-2 inline-block hover:underline">Check back later</Link>
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link to={`${ROUTES.EVENTS}?status=UPCOMING`}>
              <Button className="w-full">View Upcoming</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial / CTA */}
      <section className="py-24 bg-slate-900 text-white text-center relative overflow-hidden">
        {/* Replaced online pattern with local asset */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${cubesPattern})` }}
        />
        <div className="container-app relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-amber-400 fill-current" />)}
            </div>
            <blockquote className="text-2xl md:text-4xl font-medium leading-tight mb-10">
              "This platform completely changed how I experience college. I've found my best friends through the workshops I discovered here."
            </blockquote>
            <cite className="not-italic text-slate-400 font-medium block mb-12">- Pujon P., Information Technology Student</cite>
            
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-0 shadow-xl shadow-white/10">
                Join the Community Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
