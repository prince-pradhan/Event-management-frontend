import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { institutionsApi } from '../../api/endpoints';
import { ROUTES, INSTITUTION_STATUS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export default function InstitutionApply() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'COLLEGE',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await institutionsApi.getMine();
        if (res.data.success && res.data.institution) {
          setExistingApp(res.data.institution);
        }
      } catch (err) {
        console.error('Failed to fetch existing application', err);
      } finally {
        setLoading(false);
      }
    };
    checkExisting();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await institutionsApi.apply(formData);
      if (res.data.success) {
        setExistingApp(res.data.institution);
        addToast({
          title: 'Application Submitted',
          message: 'Your application to become an institution admin has been submitted successfully.',
          type: 'success',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = () => {
    setFormData({
      name: existingApp.name || '',
      type: existingApp.type || 'COLLEGE',
      description: existingApp.description || '',
      addressLine1: existingApp.addressLine1 || '',
      addressLine2: existingApp.addressLine2 || '',
      city: existingApp.city || '',
      state: existingApp.state || '',
      country: existingApp.country || '',
      postalCode: existingApp.postalCode || '',
      website: existingApp.website || '',
      contactEmail: existingApp.contactEmail || '',
      contactPhone: existingApp.contactPhone || '',
    });
    setExistingApp(null);
  };

  if (loading) {
    return (
      <div className="container-app py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (existingApp) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card className="text-center p-10">
          <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            {existingApp.status === INSTITUTION_STATUS.PENDING_VERIFICATION ? '⏳' : 
             existingApp.status === INSTITUTION_STATUS.VERIFIED ? '✅' : '❌'}
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Application {existingApp.status.replace('_', ' ')}</h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            {existingApp.status === INSTITUTION_STATUS.PENDING_VERIFICATION 
              ? `Your application for "${existingApp.name}" is currently under review by our administrators. We'll notify you once it's verified.`
              : existingApp.status === INSTITUTION_STATUS.VERIFIED
              ? `Congratulations! "${existingApp.name}" has been verified. You now have access to institution-level features.`
              : `Unfortunately, your application for "${existingApp.name}" was rejected.`}
          </p>

          {existingApp.status === INSTITUTION_STATUS.REJECTED && existingApp.verificationNotes && (
            <div className="mb-8 p-6 bg-red-50 rounded-2xl border border-red-100 text-left max-w-md mx-auto">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-widest mb-2">Rejection Reason:</h4>
              <p className="text-red-700 font-medium italic">"{existingApp.verificationNotes}"</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.STUDENT_DASHBOARD}>
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
            {existingApp.status === INSTITUTION_STATUS.VERIFIED && (
              <Link to={ROUTES.ADMIN_DASHBOARD}>
                <Button>Go to Institution Dashboard</Button>
              </Link>
            )}
            {existingApp.status === INSTITUTION_STATUS.REJECTED && (
              <Button onClick={handleReapply}>Reapply Now</Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Register Your Institution</h1>
        <p className="text-slate-500 font-medium">Join our ecosystem to host and manage your own campus events.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg">🏢</span>
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Institution Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. ABC Engineering College"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Institution Type</label>
              <select
                name="type"
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none bg-white font-medium text-slate-700"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="COLLEGE">College</option>
                <option value="UNIVERSITY">University</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <Input
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://abc-college.edu"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                rows="4"
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none bg-white font-medium text-slate-700"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us a bit about your institution..."
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg text-lg">📍</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Address Line 1"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address, P.O. box"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>
            <Input
              label="City"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              label="State / Province"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              label="Country"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
            />
            <Input
              label="Postal Code"
              name="postalCode"
              required
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-soft-xl border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-lg">📞</span>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="info@abc-college.edu"
            />
            <Input
              label="Contact Phone"
              name="contactPhone"
              type="tel"
              required
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+977-1-5555555"
            />
          </div>
        </section>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link to={ROUTES.STUDENT_DASHBOARD}>
            <Button variant="secondary" type="button" className="px-8 py-3">Cancel</Button>
          </Link>
          <Button loading={submitting} type="submit" className="px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200">
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
}
