import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { ROUTES, USER_ROLE } from '../../utils/constants';

/**
 * Backend User model: email, name, role (ADMIN|STUDENT), isVerified, lastLogin, firstTimeLogin, timestamps
 * allUsers: GET /api/user/user → { success, users }
 * Static rows match this shape.
 */
const STATIC_USERS = [
  { _id: '1', name: 'Admin User', email: 'admin@college.edu', role: USER_ROLE.ADMIN, isVerified: true, createdAt: '2024-01-01T00:00:00' },
  { _id: '2', name: 'Rahul Sharma', email: 'rahul@college.edu', role: USER_ROLE.STUDENT, isVerified: true, createdAt: '2024-02-15T00:00:00' },
  { _id: '3', name: 'Priya Patel', email: 'priya@college.edu', role: USER_ROLE.STUDENT, isVerified: true, createdAt: '2024-03-20T00:00:00' },
  { _id: '4', name: 'Amit Kumar', email: 'amit@college.edu', role: USER_ROLE.STUDENT, isVerified: false, createdAt: '2024-04-10T00:00:00' },
];

function formatDate(dateStr) {
  return dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
}

export default function AdminUsers() {
  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <Link to={ROUTES.ADMIN} className="text-sm font-medium text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Back to admin
        </Link>
        <h1 className="page-heading text-slate-900">Manage users</h1>
        <p className="mt-1 text-slate-600">Students and admins (User model)</p>
      </div>

      <Card padding={false} className="overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STATIC_USERS.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        user.role === USER_ROLE.ADMIN ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {user.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-500 italic">
            Static data matching backend User model. Real users (GET /api/user/user) will be manageable when connected.
          </p>
        </div>
      </Card>
    </div>
  );
}
