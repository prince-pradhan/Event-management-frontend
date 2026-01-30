import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import Button from './Button';

/**
 * Shows a banner reminding user to verify email if not verified.
 * Can be dismissed locally (stored in localStorage) but will reappear on next session.
 */
export default function VerificationBanner({ onDismiss }) {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-soft animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-900">Email verification required</h3>
            <p className="text-sm text-amber-700 mt-1">
              Please verify your email to access all features. Check your inbox for the verification code.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.VERIFY_EMAIL}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              Verify now
            </Button>
          </Link>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-amber-700">
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
