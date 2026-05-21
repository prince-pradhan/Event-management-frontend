import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  Clock, 
  LogOut, 
  Camera,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/endpoints';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * Backend User model: email, name, role, isVerified, firstTimeLogin, lastLogin, timestamps
 * (password and tokens not exposed by API)
 */
export default function StudentProfile() {
  const { user, logout, setUserFromResponse } = useAuth();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputId = 'profilePicInput';

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '—';

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="container-app py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">My Profile</h1>
      <p className="text-slate-500 font-medium mb-10">Manage your account settings and preferences</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg shadow-slate-200/50 border-0 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-600 to-primary-400" />
            
            <div className="relative flex flex-col items-center mt-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                </div>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                      addToast({ title: 'File Too Large', message: 'Please choose an image under 5MB.', type: 'warning' });
                      e.target.value = '';
                      return;
                    }
                    if (!file.type.startsWith('image/')) {
                      addToast({ title: 'Invalid File', message: 'Only image files are allowed.', type: 'error' });
                      e.target.value = '';
                      return;
                    }
                    try {
                      setUploading(true);
                      const res = await authApi.updateProfilePicture(file);
                      if (res.data?.success && res.data?.user) {
                        setUserFromResponse(res.data);
                        addToast({ title: 'Profile Updated', message: 'Your profile picture has been updated.', type: 'success' });
                      }
                    } catch (err) {
                      addToast({ title: 'Upload Failed', message: err.response?.data?.message || 'Could not update profile picture', type: 'error' });
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById(fileInputId)?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-60"
                  disabled={uploading}
                  title="Update profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-500 font-medium">{user?.email}</p>
              
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {user?.role === 'INSTITUTION_ADMIN'
                    ? 'Institution Admin'
                    : user?.role === 'STUDENT'
                      ? 'Student'
                      : 'Admin'}
                </span>
                {user?.isVerified && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Joined
                </span>
                <span className="text-slate-900 font-bold">{joinDate}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Last Login
                </span>
                <span className="text-slate-900 font-bold">{lastLogin}</span>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={logout}
                className="w-full py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <Button variant="secondary" size="sm">Edit</Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  {user?.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  {user?.email}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Account Role
                </label>
                <p className="font-semibold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  {user?.role}
                </p>
              </div>
            </div>
          </section>

          {/* Preferences Placeholder */}
            {/* <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm opacity-60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Coming Soon</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <span className="font-medium text-slate-700">Email Notifications</span>
                  <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-not-allowed">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute left-0" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                  <span className="font-medium text-slate-700">Event Reminders</span>
                  <div className="w-10 h-5 bg-primary-200 rounded-full relative cursor-not-allowed">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute right-0" />
                  </div>
                </div>
              </div>
            </section> */}
        </div>
      </div>
    </div>
  );
}
