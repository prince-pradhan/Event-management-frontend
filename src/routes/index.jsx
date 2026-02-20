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
import MyRegistrations from '../pages/student/MyRegistrations';
import Notifications from '../pages/student/Notifications';

import AdminLayout from '../components/layout/AdminLayout';
import AdminHome from '../pages/admin/AdminHome';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEvents from '../pages/admin/AdminEvents';
import AdminCreateEvent from '../pages/admin/AdminCreateEvent';
import AdminEditEvent from '../pages/admin/AdminEditEvent';
import AdminUsers from '../pages/admin/AdminUsers';
import EventRegistrations from '../pages/admin/registrations/EventRegistrations';

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
        path: 'student',
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            ),
          },
          { path: 'my-registrations', element: <ProtectedRoute><MyRegistrations /></ProtectedRoute> },
          { path: 'my-bookings', element: <Navigate to="/student/my-registrations" replace /> },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            ),
          },
        ]
      },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
  // Admin routes (Separate from main Layout to avoid double Header)
  {
    path: 'admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminHome /> },
      { path: 'management', element: <AdminDashboard /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'events/new', element: <AdminCreateEvent /> },
      { path: 'events/:id/edit', element: <AdminEditEvent /> },
      { path: 'events/:eventId/registrations', element: <EventRegistrations /> },
      { path: 'users', element: <AdminUsers /> },
    ]
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
