import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import RoleBasedNavigator from '../RoleBasedNavigator';

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <RoleBasedNavigator />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  );
}
