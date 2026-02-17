/**
 * Aligned with backend models and enums (bakend/src/models/enum.js)
 */

export const APP_NAME = 'College Event Management';

export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  // Student routes (when logged in as student)
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_MY_BOOKINGS: '/student/my-bookings',
  STUDENT_NOTIFICATIONS: '/student/notifications',
  // Admin routes (when logged in as admin)
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_EVENTS_CREATE: '/admin/events/new',
  ADMIN_USERS: '/admin/users',
  // Aliases for menu/redirects
  ADMIN: '/admin/dashboard',
};

/** Backend: USER_ROLE */
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
};

/** Backend: EVENT_STATUS */
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

/** Backend: BOOKING_STATUS */
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
};

/** Backend: PAYMENT_STATUS */
export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
};

/** Backend: NOTIFICATION_TYPE */
export const NOTIFICATION_TYPE = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
};

/** Display labels for category names (Category model: name, description) */
export const CATEGORY_LABELS = {
  seminar: 'Seminar',
  workshop: 'Workshop',
  festival: 'Festival',
  club: 'Club Activity',
  training: 'Training',
  other: 'Other',
};

/** Fallback when category is object with .name */
export function getCategoryLabel(category) {
  if (!category) return 'Event';
  const name = typeof category === 'object' ? category?.name : category;
  return CATEGORY_LABELS[name] || name || 'Event';
}
