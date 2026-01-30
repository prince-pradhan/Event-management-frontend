import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-subtle">
      <p className="text-8xl font-bold text-primary-200">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-4">Page not found</h1>
      <p className="mt-2 text-slate-600 max-w-sm">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link to={ROUTES.HOME} className="mt-8">
        <Button size="lg" className="btn-primary-gradient">Go to home</Button>
      </Link>
    </div>
  );
}
