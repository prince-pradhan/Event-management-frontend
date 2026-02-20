import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { categoriesApi } from '../../api/endpoints/categories';
import { eventsApi } from '../../api/endpoints/events';
import { ROUTES, EVENT_STATUS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function AdminEditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        // Location
        venue: '',
        address: '',
        city: '',
        // Dates
        startDate: '',
        endDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        // Capacity & Price
        totalSeats: '',
        price: 0,
        // Media
        bannerImage: '',
    });

    const [initialSeats, setInitialSeats] = useState({ total: 0, available: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, eventRes] = await Promise.all([
                    categoriesApi.getAll(),
                    eventsApi.getById(id),
                ]);

                if (catRes.data.success) setCategories(catRes.data.categories);

                if (eventRes.data.success) {
                    const event = eventRes.data.event;

                    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm) - Local Time
                    const toLocalISO = (d) => {
                        if (!d) return '';
                        const date = new Date(d);
                        const pad = (n) => n.toString().padStart(2, '0');
                        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                    };

                    setFormData({
                        title: event.title,
                        description: event.description || '',
                        category: typeof event.category === 'object' ? event.category._id : event.category,
                        venue: event.location?.venue || '',
                        address: event.location?.address || '',
                        city: event.location?.city || '',
                        startDate: toLocalISO(event.startDate),
                        endDate: toLocalISO(event.endDate),
                        registrationStartDate: toLocalISO(event.registrationStartDate),
                        registrationEndDate: toLocalISO(event.registrationEndDate),
                        totalSeats: event.totalSeats || '',
                        price: event.price || 0,
                        bannerImage: event.bannerImage || '',
                    });

                    setInitialSeats({
                        total: event.totalSeats || 0,
                        available: event.availableSeats || 0
                    });

                    if (event.registrationFields) {
                        setRegFields(event.registrationFields);
                    }
                }
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Failed to load event data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addRegField = () => {
        // Disabled per backend constraints
        alert('Adding new fields to an existing event is not supported by the backend.');
    };

    const removeRegField = (index) => {
        // Disabled per backend constraints
        alert('Removing fields from an existing event is not supported by the backend.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Helper to convert local ISO string back to UTC
            const toUTC = (dateStr) => dateStr ? new Date(dateStr).toISOString() : null;

            // Simple capacity sync logic:
            // adjust availableSeats by the same amount totalSeats changed
            const newTotal = Number(formData.totalSeats);
            const diff = newTotal - initialSeats.total;
            const newAvailable = Math.max(0, initialSeats.available + diff);

            // Construct payload
            const payload = {
                ...formData,
                startDate: toUTC(formData.startDate),
                endDate: toUTC(formData.endDate),
                registrationStartDate: toUTC(formData.registrationStartDate),
                registrationEndDate: toUTC(formData.registrationEndDate),
                location: {
                    venue: formData.venue,
                    address: formData.address,
                    city: formData.city,
                },
                // registrationFields: regFields, // Backend rejects updates to this anyway
                totalSeats: newTotal,
                availableSeats: newAvailable,
                price: Number(formData.price),
            };

            const response = await eventsApi.update(id, payload);
            if (response.data.success) {
                navigate(ROUTES.ADMIN_EVENTS);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading editor...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <Link to={ROUTES.ADMIN_EVENTS} className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-block uppercase tracking-wider">
                        ← Back to events
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Event</h1>
                    <p className="mt-2 text-slate-500 font-medium">Refining the details for your upcoming showcase.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_EVENTS)} className="px-6 border-slate-200">Cancel</Button>
                    <Button type="submit" form="edit-event-form" disabled={saving} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                        {saving ? 'Saving...' : 'Update Event'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-start gap-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-[10px] mb-1">Error Encountered</h3>
                        <p className="text-sm font-medium opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form id="edit-event-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100/50 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl text-xl shadow-sm border border-blue-100/50">
                                📝
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Core Details</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Title, Banner & Story</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Event Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="Enter a catchy title..."
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-300 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Narrative / Description</label>
                                <textarea
                                    name="description"
                                    rows="6"
                                    placeholder="Tell the story of your event..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-700 font-medium placeholder:text-slate-300 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Visual Brand (Banner URL)</label>
                                <input
                                    type="text"
                                    name="bannerImage"
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.bannerImage}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 text-slate-600 font-medium shadow-sm transition-all"
                                />
                                {formData.bannerImage && (
                                    <div className="mt-6 rounded-2xl overflow-hidden border-4 border-white shadow-lg aspect-video bg-slate-50 relative group">
                                        <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100/50 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl text-xl shadow-sm border border-purple-100/50">
                                📍
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Logistics</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Timing & Venue Mapping</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Commences</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-3.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-bold text-slate-700 shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Concludes</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-3.5 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-bold text-slate-700 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-slate-50">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Name of Venue</label>
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="e.g. Main Auditorium"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-bold text-slate-800 shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Exact Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street, Milestone..."
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-bold text-slate-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">City / Campus</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City Name"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-bold text-slate-800 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-10">
                    <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100/50 p-7">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xl shadow-sm border border-emerald-100/50">
                                ⚙️
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Configuration</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Access & Capacity</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Niche / Category</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 bg-slate-50 font-bold text-slate-900 shadow-sm appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Max Seats</label>
                                    <input
                                        type="number"
                                        name="totalSeats"
                                        value={formData.totalSeats}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border-slate-200 px-5 py-4 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 font-black text-slate-900 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-slate-50">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Registration Window</h3>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2 ml-1">Opening Moment</label>
                                        <input
                                            type="datetime-local"
                                            name="registrationStartDate"
                                            value={formData.registrationStartDate}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-slate-100 text-sm focus:border-primary-500 font-bold text-slate-600 shadow-sm px-4 py-2.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2 ml-1">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            name="registrationEndDate"
                                            value={formData.registrationEndDate}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-slate-100 text-sm focus:border-primary-500 font-bold text-slate-600 shadow-sm px-4 py-2.5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100/50 p-7">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl text-xl shadow-sm border border-amber-100/50">
                                📋
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Form Blueprint</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Attendee Data Requirements</p>
                            </div>
                        </div>

                        {/* WARNING ALERT */}
                        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200/50 flex gap-3 items-start">
                            <span className="text-lg">⚠️</span>
                            <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                                Registration fields cannot be modified after an event is created. This is a backend restriction to maintain data integrity.
                            </p>
                        </div>

                        <div className="space-y-3 mb-8 opacity-70 cursor-not-allowed">
                            {regFields.length === 0 && (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No custom fields defined</p>
                                </div>
                            )}
                            {regFields.map((field, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm group">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[11px] text-slate-800 uppercase tracking-widest truncate">{field.label}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 lowercase tracking-wider">{field.fieldType} • {field.required ? 'Required' : 'Optional'}</p>
                                    </div>
                                    <div className="p-2 text-slate-200">
                                        ✕
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center opacity-40 select-none grayscale cursor-not-allowed">
                            <div className="text-2xl mb-2">🔒</div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blueprint Locked</p>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}
