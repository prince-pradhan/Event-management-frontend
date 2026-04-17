/**
 * Aligned with backend models and enums (bakend/src/models/enum.js)
 */

export const APP_NAME = 'EduEvents';

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
  STUDENT_CALENDAR: '/student/calendar',
  STUDENT_MY_REGISTRATIONS: '/student/my-registrations',
  STUDENT_NOTIFICATIONS: '/student/notifications',
  INSTITUTION_APPLY: '/student/institution-apply',
  // Admin routes (when logged in as admin)
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_EVENT_DETAIL: '/admin/events/:id',
  ADMIN_EVENTS_CREATE: '/admin/events/new',
  ADMIN_EVENT_EDIT: '/admin/events/:id/edit',
  ADMIN_EVENT_REVIEWS: '/admin/events/:id/reviews',
  ADMIN_EVENT_REGISTRATIONS: '/admin/events/:id/registrations',
  ADMIN_USERS: '/admin/users',
  ADMIN_INSTITUTIONS: '/admin/institutions',
  INSTITUTION_ADMIN_DASHBOARD: '/institution-admin/dashboard',
  // Aliases for menu/redirects
  ADMIN: '/admin/dashboard',
};

/** Backend: USER_ROLE */
export const USER_ROLE = {
  ADMIN: 'ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  STUDENT: 'STUDENT',
};

/** Backend: INSTITUTION_STATUS */
export const INSTITUTION_STATUS = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

/** Backend: EVENT_STATUS */
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  UPCOMING: 'UPCOMING',
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

/** Backend: NOTIFICATION_TYPE (Delivery methods) */
export const NOTIFICATION_TYPE = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
};

/** Backend: notification categories */
export const NOTIFICATION_CATEGORY = {
  NEW_EVENT: 'NEW_EVENT',
  EVENT_REMINDER: 'EVENT_REMINDER',
  EVENT_UPDATED: 'EVENT_UPDATED',
  SYSTEM: 'SYSTEM',
};

/** Backend: notification scopes */
export const NOTIFICATION_SCOPE = {
  BROADCAST: 'BROADCAST',
  TARGETED: 'TARGETED',
  PERSONALIZED: 'PERSONALIZED',
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
