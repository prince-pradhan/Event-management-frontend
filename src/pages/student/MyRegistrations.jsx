import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Filter,
  ArrowUpRight,
  Download,
  X,
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import PayPalPayment from '../../components/common/PayPalPayment';
import { ROUTES } from '../../utils/constants';
import { registrationsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import QRCode from 'qrcode';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const { addToast } = useToast();
  const confirm = useConfirm();

  // Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const ticketRef = useRef(null);

  // Payment Modal State (for unpaid / PENDING registrations)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingReg, setPayingReg] = useState(null);

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

  const handleViewTicket = async (reg) => {
    setSelectedReg(reg);
    setQrDataUrl('');
    setShowTicketModal(true);
    try {
      // Encode the same payload the backend embeds in the confirmation email.
      const payload = JSON.stringify({
        registrationId: reg._id,
        event: reg.event?.title,
        user: user?.name,
      });
      const url = await QRCode.toDataURL(payload, { width: 256, margin: 1 });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate ticket QR code:', err);
      setQrDataUrl('');
    }
  };

  const handlePayNow = (reg) => {
    setPayingReg(reg);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r._id === payingReg?._id
          ? { ...r, status: 'REGISTERED', paymentStatus: 'PAID' }
          : r
      )
    );
    setShowPaymentModal(false);
    setPayingReg(null);
  };

  const handleCancelRegistration = async (reg) => {
    const ok = await confirm({
      title: 'Cancel registration?',
      message: `Cancel your registration for "${reg.event?.title}"? This frees up your seat and can't be undone.`,
      confirmLabel: 'Cancel registration',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await registrationsApi.cancel(reg._id);
      if (res.data?.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === reg._id ? { ...r, status: 'CANCELLED' } : r))
        );
        addToast({ type: 'success', title: 'Registration cancelled', message: 'Your registration has been cancelled.' });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Cancel failed', message: err.response?.data?.message || 'Could not cancel the registration.' });
    }
  };

  const downloadTicket = async () => {
    if (!selectedReg || !ticketRef.current) return;
    
    try {
      setDownloading(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#f8fafc',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ticket-${selectedReg.event?.title}-${selectedReg._id.slice(-6)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      addToast({ type: 'error', title: 'Download failed', message: 'Failed to download ticket. Please try again.' });
    } finally {
      setDownloading(false);
    }
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
            {registrations.filter(r => r.status === 'REGISTERED' && r.event?.status !== 'CANCELLED').length}
          </p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
          <p className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">Upcoming</p>
          <p className="text-3xl font-black text-amber-900">
            {registrations.filter(r => new Date(r.event?.startDate) >= new Date() && r.status === 'REGISTERED' && r.event?.status !== 'CANCELLED').length}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Completed</p>
          <p className="text-3xl font-black text-slate-700">
            {registrations.filter(r => new Date(r.event?.startDate) < new Date() && r.status === 'REGISTERED' && r.event?.status !== 'CANCELLED').length}
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
                    ) : reg.status === 'PENDING' ? (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Payment Pending
                      </span>
                    ) : reg.status === 'FAILED' ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Payment Failed
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
                  {reg.status === 'PENDING' && reg.event?.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handlePayNow(reg)}
                      className="w-full whitespace-nowrap px-4 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Complete Payment
                    </button>
                  )}
                  {reg.status === 'REGISTERED' && reg.event?.status !== 'CANCELLED' && new Date(reg.event?.startDate) >= new Date() && (
                    <button
                      onClick={() => handleViewTicket(reg)}
                      className="w-full whitespace-nowrap px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      Ticket
                    </button>
                  )}
                  {(reg.status === 'REGISTERED' || reg.status === 'PENDING') && reg.event?.status !== 'CANCELLED' && new Date(reg.event?.startDate) >= new Date() && (
                    <button
                      onClick={() => handleCancelRegistration(reg)}
                      className="w-full whitespace-nowrap px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Ticket Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Event Ticket"
      >
        {selectedReg && (
          <div className="space-y-6">
            <div 
              ref={ticketRef}
              className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden"
            >
              {/* Ticket Top */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event Ticket</p>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedReg.event?.title}</h3>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase">
                  Confirmed
                </div>
              </div>

              {/* Ticket Body */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(selectedReg.event?.startDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="text-sm font-bold text-slate-700">{formatTime(selectedReg.event?.startDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Venue</p>
                  <p className="text-sm font-bold text-slate-700">{selectedReg.event?.location?.venue || 'TBD'}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center py-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Ticket QR code"
                    className="w-32 h-32 rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                    <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
                  </div>
                )}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">#{selectedReg._id.slice(-12).toUpperCase()}</p>
              </div>

              {/* Decorative Circles */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full border-r border-slate-200 -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full border-l border-slate-200 -translate-y-1/2"></div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => setShowTicketModal(false)}
                disabled={downloading}
              >
                Close
              </Button>
              <Button 
                className="flex-1 flex items-center justify-center gap-2"
                onClick={downloadTicket}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal — complete payment for a PENDING registration */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setPayingReg(null); }}
        title="Complete Payment"
      >
        {payingReg && (
          <div className="space-y-4">
            <p className="text-slate-600">
              Complete the payment for <strong>{payingReg.event?.title}</strong> to confirm your registration.
            </p>
            <PayPalPayment
              registrationId={payingReg._id}
              onApprove={handlePaymentSuccess}
              onError={(msg) => addToast({ type: 'error', title: 'Payment failed', message: msg || 'Payment failed. Please try again.' })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
