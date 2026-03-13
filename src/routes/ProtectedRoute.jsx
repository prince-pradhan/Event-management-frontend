import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLE } from '../utils/constants';

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  systemAdminOnly = false,
  allowedRoles = [] 
}) {
  const { user, loading, isAuthenticated, isAdmin, isSystemAdmin, isInstitutionAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Role-based access control (RBAC) via allowedRoles array (Recommended)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={isInstitutionAdmin ? ROUTES.INSTITUTION_ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD} replace />;
  }

  // System Admin only routes (e.g., /admin/*)
  if (systemAdminOnly && !isSystemAdmin) {
    return <Navigate to={isInstitutionAdmin ? ROUTES.INSTITUTION_ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD} replace />;
  }

  // General Admin or Institution Admin routes (e.g., /institution-admin/*)
  if (adminOnly && !isAdmin) {
    return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  }

  // If a student tries to access an admin-guarded area via URL
  if (user?.role === USER_ROLE.STUDENT && adminOnly) {
     return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
  }

  // If an institution admin tries to access student areas (optional, but requested "protect route")
  if (isInstitutionAdmin && !adminOnly && !systemAdminOnly && location.pathname.startsWith('/student')) {
    return <Navigate to={ROUTES.INSTITUTION_ADMIN_DASHBOARD} replace />;
  }

  return children;
}
