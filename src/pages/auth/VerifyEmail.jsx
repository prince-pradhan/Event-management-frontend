import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLE } from '../../utils/constants';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * Backend: POST /api/user/verify-email { code }
 * Response: { success, message, user } (user with isVerified: true)
 * After signup user receives email with verification code; they enter it here.
 */
export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyEmail(code.trim());
      if (res.data?.success && res.data?.user) {
        setSuccess(true);
        const user = res.data.user;
        const target = user.role === USER_ROLE.ADMIN ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
        setTimeout(() => navigate(target, { replace: true }), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12 bg-gradient-subtle">
      <Card className="w-full max-w-md shadow-soft-lg animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ✉️
          </div>
          <h1 className="page-heading text-slate-900">Verify your email</h1>
          <p className="mt-2 text-slate-600">
            {fromRegister
              ? 'We sent a verification code to your email. Enter it below.'
              : 'Enter the verification code from your email.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Verification code"
            type="text"
            placeholder="e.g. 123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-medium">
              Email verified! Redirecting...
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify email'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Didn&apos;t receive the code?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
          {' '}or{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-primary-600 hover:text-primary-700">
            Register again
          </Link>
        </p>
      </Card>
    </div>
  );
}
