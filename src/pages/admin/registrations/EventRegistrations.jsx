import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../utils/constants';
import { registrationsApi, eventsApi } from '../../../api/endpoints';

function formatDate(dateStr) {
    return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

export default function EventRegistrations() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventRes, regRes] = await Promise.all([
                    eventsApi.getById(eventId),
                    registrationsApi.getByEvent(eventId)
                ]);

                if (eventRes.data.success) setEvent(eventRes.data.event);
                if (regRes.data.success) setRegistrations(regRes.data.registrations);
            } catch (err) {
                console.error('Error fetching registrations:', err);
                setError('Failed to load registrations. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    const handleExport = () => {
        if (registrations.length === 0) {
            alert('No registrations to export.');
            return;
        }

        // 1. Collect all unique additional info keys
        const additionalKeys = new Set();
        registrations.forEach(reg => {
            if (reg.additionalInfo) {
                Object.keys(reg.additionalInfo).forEach(key => additionalKeys.add(key));
            }
        });
        const dynamicHeaders = Array.from(additionalKeys);

        // 2. Define standard headers
        const baseHeaders = ['Name', 'Email', 'Registration Date', 'Status'];
        const allHeaders = [...baseHeaders, ...dynamicHeaders];

        // 3. Create CSV rows
        const csvRows = [
            allHeaders.join(','), // Header row
            ...registrations.map(reg => {
                const row = [
                    `"${reg.user?.name || 'Unknown'}"`,
                    `"${reg.user?.email || 'N/A'}"`,
                    `"${formatDate(reg.createdAt)}"`,
                    '"CONFIRMED"'
                ];

                // Add dynamic info
                dynamicHeaders.forEach(key => {
                    const val = reg.additionalInfo?.[key] ?? '';
                    row.push(`"${val.toString().replace(/"/g, '""')}"`);
                });

                return row.join(',');
            })
        ];

        // 4. Generate Blob and Download
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const fileName = `${event?.title || 'event'}_registrations_${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin shadow-inner" />
                </div>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">Loading registrations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-100 pb-10">
                <div>
                    <Link to={ROUTES.ADMIN_EVENTS} className="text-xs font-black text-primary-600 hover:text-primary-700 mb-4 inline-block uppercase tracking-[0.2em] transition-all">
                        ← Return to Events
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {event?.title || 'Event Registrations'}
                    </h1>
                    <div className="mt-3 flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-slate-200">
                            {registrations.length} Attendees
                        </span>
                        <p className="text-slate-400 font-medium text-sm">
                            View and manage all registered participants.
                        </p>
                    </div>
                </div>
                <Button onClick={handleExport} className="px-8 py-3.5 bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-xl shadow-slate-100 transition-all font-black text-xs uppercase tracking-widest active:scale-[0.98]">
                    📥 Download CSV Report
                </Button>
            </div>

            {error && (
                <div className="mb-10 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-start gap-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-[10px] mb-1">System Error</h3>
                        <p className="text-sm font-medium opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-soft-2xl border border-slate-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name / Identity</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Metadata</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registered On</th>
                                <th className="text-left px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Extended Specs</th>
                                <th className="text-right px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-24 text-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50 grayscale border-2 border-white shadow-inner">
                                            🎫
                                        </div>
                                        <h3 className="text-slate-900 font-black tracking-tight text-lg">No Attendees Yet</h3>
                                        <p className="text-slate-400 font-medium text-sm mt-1 max-w-xs mx-auto">No one has registered for this event yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-100 to-white flex items-center justify-center text-slate-900 font-black text-sm border-2 border-white shadow-soft-lg group-hover:scale-110 transition-transform">
                                                    {reg.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="font-black text-slate-900 text-sm tracking-tight">{reg.user?.name || 'Anonymous User'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                                {reg.user?.email || 'private@identity.com'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-800 tracking-tight">{formatDate(reg.createdAt).split('at')[0]}</span>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase mt-0.5">{formatDate(reg.createdAt).split('at')[1]}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-2 max-w-md">
                                                {reg.additionalInfo && Object.entries(reg.additionalInfo).length > 0 ? (
                                                    Object.entries(reg.additionalInfo).map(([key, val]) => (
                                                        <div key={key} className="flex flex-col bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100/50 shadow-sm">
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{key}</span>
                                                            <span className="text-[11px] font-bold text-slate-700 leading-none">{val.toString()}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-200 font-bold italic text-xs">— No Data —</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Verified
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        Attendee Data
                    </p>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
