import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES, USER_ROLE } from "../../utils/constants";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

/**
 * Backend: POST /api/user/login { email, password }
 * Redirect: admin → /admin/dashboard, student → /student/dashboard
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ email, password });
      const user = res.data?.user;

      // If user is not verified, redirect to verification page
      if (user && !user.isVerified) {
        navigate(ROUTES.VERIFY_EMAIL, {
          replace: true,
          state: { message: "Please verify your email to continue." },
        });
        return;
      }

      // Redirect based on role
      if (user?.role === USER_ROLE.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12 bg-gradient-subtle">
      <Card className="w-full max-w-md shadow-soft-lg animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="page-heading text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
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
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Create one
          </Link>
        </p>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const res = await axios.post("/api/auth/google", {
              token: credentialResponse.credential,
            });
            console.log(res.data);
          }}
          onError={() => console.log("Google Login Failed")}
        />
      </Card>
    </div>
  );
}
