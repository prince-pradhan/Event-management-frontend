import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ROUTES, BOOKING_STATUS, PAYMENT_STATUS } from '../../utils/constants';
import { registrationsApi } from '../../api/endpoints';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';
  };
  return (
    <div className="container-app py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-heading text-slate-900">My registrations</h1>
          <p className="mt-1 text-slate-600">Events you have signed up for</p>
        </div>
        <Link to={ROUTES.EVENTS} className="inline-block">
          <Button>Browse events</Button>
        </Link>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
              Loading registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl mb-4 block">🎫</span>
              <p className="text-slate-600 font-medium">You haven&apos;t registered for any events yet.</p>
              <Link to={ROUTES.EVENTS} className="text-primary-600 hover:text-primary-700 text-sm font-bold mt-2 inline-block">
                Explore Events
              </Link>
            </div>
          ) : (
            registrations.map((reg) => (
              <div
                key={reg._id}
                className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{reg.event?.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDate(reg.event?.startDate)} · {reg.event?.location?.venue}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700">
                    Confirmed
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
