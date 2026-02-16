import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';

/**
 * Backend User model: email, name, role, isVerified, firstTimeLogin, lastLogin, timestamps
 * (password and tokens not exposed by API)
 */
export default function StudentProfile() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '—';

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  return (
    <div className="container-app py-10">
      <h1 className="page-heading text-slate-900 mb-8">Profile</h1>

      <div className="max-w-xl">
        <Card className="shadow-soft-lg">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold flex items-center justify-center shadow-soft">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-600">{user?.email}</p>
              <span className="inline-block mt-2 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                {user?.role === 'ADMIN' ? 'Admin' : 'Student'}
              </span>
              {user?.isVerified && (
                <span className="ml-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  Verified
                </span>
              )}
            </div>
          </div>
          <dl className="space-y-4 border-t border-slate-100 pt-6">
            <div>
              <dt className="text-sm font-medium text-slate-500">Full name</dt>
              <dd className="mt-1 text-slate-900 font-medium">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-900 font-medium">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Role</dt>
              <dd className="mt-1 text-slate-900 font-medium">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email verified</dt>
              <dd className="mt-1 text-slate-900 font-medium">{user?.isVerified ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last login</dt>
              <dd className="mt-1 text-slate-900 font-medium">{lastLogin}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
