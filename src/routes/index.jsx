import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES } from '../utils/constants';

import Home from '../pages/Home';
import Events from '../pages/Events';
import EventDetail from '../pages/EventDetail';
import NotFound from '../pages/NotFound';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';

import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import MyBookings from '../pages/student/MyBookings';
import Notifications from '../pages/student/Notifications';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminCreateEvent from '../pages/admin/AdminCreateEvent';
import AdminEditEvent from '../pages/admin/AdminEditEvent';
import AdminUsers from '../pages/admin/AdminUsers';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:id', element: <EventDetail /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      // Student routes
      {
        path: 'student/dashboard',
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/profile',
        element: (
          <ProtectedRoute>
            <StudentProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/notifications',
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },
      // Admin routes
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/events',
        element: (
          <ProtectedRoute adminOnly>
            <AdminEvents />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/events/new',
        element: (
          <ProtectedRoute adminOnly>
            <AdminCreateEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/events/:id/edit',
        element: (
          <ProtectedRoute adminOnly>
            <AdminEditEvent />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        ),
      },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
