import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container-app py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <Link to={ROUTES.HOME} className="text-white font-bold text-lg">
              {APP_NAME}
            </Link>
            <p className="mt-2 text-sm max-w-xs text-slate-400">
              One place for seminars, workshops, festivals, and club activities.
            </p>
          </div>
{/* Links removed as requested */}
        </div>
        <div className="mt-10 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
