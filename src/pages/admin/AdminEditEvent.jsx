import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

    const [regFields, setRegFields] = useState([]);
    const [newField, setNewField] = useState({ label: '', name: '', fieldType: 'text', required: false });

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
        if (!newField.label || !newField.name) return;
        setRegFields(prev => [...prev, newField]);
        setNewField({ label: '', name: '', fieldType: 'text', required: false });
    };

    const removeRegField = (index) => {
        setRegFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Helper to convert local ISO string back to UTC
            const toUTC = (dateStr) => dateStr ? new Date(dateStr).toISOString() : null;

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
                registrationFields: regFields,
                totalSeats: Number(formData.totalSeats),
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

    if (loading) return <div className="p-20 text-center text-slate-500">Loading editor...</div>;

    return (
        <div className="container-app py-12 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Event</h1>
                    <p className="mt-2 text-slate-600">Update event details, status, and registration settings.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => navigate(ROUTES.ADMIN_EVENTS)}>Cancel</Button>
                    <Button type="submit" form="edit-event-form" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <h3 className="font-semibold">Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form id="edit-event-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    📝
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Event Details</h2>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    rows="5"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Banner Image URL</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        name="bannerImage"
                                        value={formData.bannerImage}
                                        onChange={handleChange}
                                        className="flex-1 rounded-xl border-slate-200 px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 text-slate-600"
                                    />
                                </div>
                                {formData.bannerImage && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 aspect-video bg-slate-50">
                                        <img src={formData.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                📍
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Date & Location</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    required
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    required
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-slate-200 focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-8">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                ⚙️
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Settings</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500 bg-slate-50"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Seats</label>
                                    <input
                                        type="number"
                                        name="totalSeats"
                                        value={formData.totalSeats}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-slate-200 px-4 py-2.5 focus:border-primary-500 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-semibold text-slate-900">Registration Window</h3>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Opens</label>
                                    <input
                                        type="datetime-local"
                                        name="registrationStartDate"
                                        value={formData.registrationStartDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Closes</label>
                                    <input
                                        type="datetime-local"
                                        name="registrationEndDate"
                                        value={formData.registrationEndDate}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                📋
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Registration Form</h2>
                        </div>

                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">Customize the registration form for students.</p>

                        <div className="space-y-3 mb-6">
                            {regFields.length === 0 && (
                                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-400">No custom fields added</p>
                                </div>
                            )}
                            {regFields.map((field, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-700 truncate">{field.label}</p>
                                        <p className="text-xs text-slate-500">{field.fieldType} • {field.required ? 'Required' : 'Optional'}</p>
                                    </div>
                                    <button type="button" onClick={() => removeRegField(idx)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add New Field</h3>
                            <input
                                type="text"
                                placeholder="Label (e.g. Diet Preference)"
                                value={newField.label}
                                onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Key (e.g. diet)"
                                    value={newField.name}
                                    onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                                />
                                <select
                                    value={newField.fieldType}
                                    onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
                                    className="w-full rounded-lg border-slate-200 text-sm focus:border-primary-500 focus:ring-primary-500"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="checkbox">Checkbox</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="req-check"
                                    checked={newField.required}
                                    onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                                    className="rounded text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="req-check" className="text-sm text-slate-600">Required field</label>
                            </div>
                            <Button size="sm" onClick={addRegField} variant="secondary" className="w-full justify-center">Add Field</Button>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}
