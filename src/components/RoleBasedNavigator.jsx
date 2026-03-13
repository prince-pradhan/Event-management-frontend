import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLE } from '../utils/constants';

function RoleBasedNavigator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect to congratulations if they just got verified and are NOT already in the admin panel
    if (
      user?.role === USER_ROLE.INSTITUTION_ADMIN && 
      location.pathname !== '/congratulations' &&
      !location.pathname.startsWith('/institution-admin')
    ) {
      // You might want to use a state or localStorage to only show this ONCE after verification
      // For now, let's just make sure it doesn't break admin access
    }
  }, [user, navigate, location]);

  return null;
}

export default RoleBasedNavigator;
