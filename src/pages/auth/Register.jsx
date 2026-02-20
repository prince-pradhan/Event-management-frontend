import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLE } from '../../utils/constants';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { GoogleLogin } from "@react-oauth/google";
import { authApi } from "../../api/endpoints/auth";

/**
 * Backend: POST /api/user/signup { email, name, password, role? }
 * Sends verification email; user must verify with code on /verify-email.
 */
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, setUserFromResponse } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
      // On success, redirect to login or verify email depending on backend flow
      // The current flow suggests verify-email
      navigate(ROUTES.VERIFY_EMAIL, { state: { email, fromRegister: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12 bg-gradient-subtle">
      <Card className="w-full max-w-md shadow-soft-lg animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="page-heading text-slate-900">Create account</h1>
          <p className="mt-2 text-slate-600">Join to browse and register for events.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
        <div className="mt-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setError("");
              setLoading(true);
              try {
                const res = await authApi.googleLogin(credentialResponse.credential);
                setUserFromResponse(res.data);
                const user = res.data?.user;
                if (user && !user.isVerified) {
                  navigate(ROUTES.VERIFY_EMAIL, {
                    replace: true,
                    state: { message: "Please verify your email to continue." },
                  });
                  return;
                }
                if (user?.role === USER_ROLE.ADMIN) {
                  navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
                } else {
                  navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
                }
              } catch (err) {
                setError(
                  err.response?.data?.message || "Google sign-in failed. Please try again.",
                );
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError("Google sign-in was cancelled or failed.");
            }}
          />
        </div>
      </Card>
    </div>
  );
}
