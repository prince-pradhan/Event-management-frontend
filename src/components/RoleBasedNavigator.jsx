import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLE } from '../utils/constants';

function RoleBasedNavigator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.role === USER_ROLE.INSTITUTION_ADMIN && location.pathname !== '/congratulations') {
      navigate('/congratulations');
    }
  }, [user, navigate, location]);

  return null;
}

export default RoleBasedNavigator;
