import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import { ROUTES, USER_ROLE } from '../utils/constants';

import Home from '../pages/public/Home';
import Events from '../pages/public/Events';
import EventDetail from '../pages/public/EventDetail';
import NotFound from '../pages/NotFound';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyEmail from '../pages/auth/VerifyEmail';
import CongratulationsPage from '../pages/auth/CongratulationsPage';

import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import StudentCalendar from '../pages/student/Calendar';
import MyRegistrations from '../pages/student/MyRegistrations';
import InstitutionApply from '../pages/student/InstitutionApply';
import Notifications from '../pages/student/Notifications';
import NotificationDetail from '../pages/student/NotificationDetail';

import AdminLayout from '../components/layout/AdminLayout';
import AdminHome from '../pages/admin/AdminHome';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEvents from '../pages/admin/events/AdminEvents';
import AdminEventDetail from '../pages/admin/events/AdminEventDetail';
import AdminCreateEvent from '../pages/admin/events/AdminCreateEvent';
import AdminEditEvent from '../pages/admin/events/AdminEditEvent';
import AdminEventReviews from '../pages/admin/events/AdminEventReviews';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminInstitutions from '../pages/admin/AdminInstitutions';
import AdminCategories from '../pages/admin/AdminCategories';
import EventRegistrations from '../pages/admin/registrations/EventRegistrations';
import AdminNotifications from '../pages/admin/AdminNotifications';

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
      { path: 'congratulations', element: <CongratulationsPage /> },
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
          {
            path: 'calendar',
            element: (
              <ProtectedRoute>
                <StudentCalendar />
              </ProtectedRoute>
            ),
          },
          { path: 'my-registrations', element: <ProtectedRoute><MyRegistrations /></ProtectedRoute> },
          { path: 'institution-apply', element: <ProtectedRoute><InstitutionApply /></ProtectedRoute> },
          { path: 'my-bookings', element: <Navigate to="/student/my-registrations" replace /> },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notifications/:id',
            element: (
              <ProtectedRoute>
                <NotificationDetail />
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
      <ProtectedRoute allowedRoles={[USER_ROLE.SYSTEM_ADMIN, USER_ROLE.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'events/new', element: <AdminCreateEvent /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'events/:id', element: <AdminEventDetail /> },
      { path: 'events/:id/edit', element: <AdminEditEvent /> },
      { path: 'events/:id/reviews', element: <AdminEventReviews /> },
      { path: 'events/:eventId/registrations', element: <EventRegistrations /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'institutions', element: <AdminInstitutions /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'notifications', element: <AdminNotifications /> },
    ]
  },
  {
    path: 'institution-admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/institution-admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard showUsersCard={false} institutionOnly /> },
      { path: 'events/new', element: <AdminCreateEvent /> },
      { path: 'events', element: <AdminEvents /> },
      { path: 'events/:id', element: <AdminEventDetail /> },
      { path: 'events/:id/edit', element: <AdminEditEvent /> },
      { path: 'events/:id/reviews', element: <AdminEventReviews /> },
      { path: 'events/:eventId/registrations', element: <EventRegistrations /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'notifications', element: <AdminNotifications /> },
    ]
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
