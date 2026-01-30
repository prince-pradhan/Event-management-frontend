# College Event Management – Frontend

React + Tailwind + JSX frontend for a centralized college event management web app (seminars, workshops, festivals, club activities, trainings).

## Tech Stack

- **React 18** (JSX only, no TypeScript)
- **Vite** – build tool and dev server
- **Tailwind CSS** – styling
- **React Router v6** – routing
- **Axios** – API client (with credentials for cookies)

## Project Structure

```
frontend/
├── public/                 # Static assets
│   └── favicon.svg
├── src/
│   ├── api/                # API layer
│   │   ├── apiClient.js    # Axios instance, interceptors
│   │   └── endpoints/      # Per-domain API functions
│   │       ├── auth.js
│   │       ├── events.js
│   │       └── index.js
│   ├── assets/             # Images, fonts (optional)
│   ├── components/
│   │   ├── common/         # Reusable UI (Button, Input, Card)
│   │   ├── layout/         # Header, Footer, Layout
│   │   └── events/         # EventCard, EventFilters
│   ├── context/            # React Context (e.g. AuthContext)
│   ├── hooks/              # Custom hooks (useAuth, etc.)
│   ├── pages/              # Route-level components
│   │   ├── Home.jsx
│   │   ├── Events.jsx
│   │   ├── EventDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── MyBookings.jsx
│   │   ├── Notifications.jsx
│   │   ├── Admin.jsx
│   │   ├── NotFound.jsx
│   │   └── admin/
│   │       ├── AdminEvents.jsx
│   │       └── AdminUsers.jsx
│   ├── routes/
│   │   ├── index.jsx       # Route definitions
│   │   └── ProtectedRoute.jsx
│   ├── styles/
│   │   └── index.css       # Tailwind imports + global styles
│   ├── utils/
│   │   └── constants.js    # ROUTES, USER_ROLES, etc.
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js         # Proxy /api → backend
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── README.md
```

## Routes

| Path              | Access    | Description              |
|-------------------|-----------|--------------------------|
| `/`               | Public    | Home                     |
| `/events`         | Public    | List events              |
| `/events/:id`     | Public    | Event detail             |
| `/login`          | Public    | Login                    |
| `/register`       | Public    | Register                 |
| `/dashboard`      | Auth      | Student/Admin dashboard  |
| `/profile`        | Auth      | User profile             |
| `/my-bookings`    | Auth      | User bookings            |
| `/notifications`  | Auth      | Notifications            |
| `/admin`          | Admin     | Admin panel              |
| `/admin/events`   | Admin     | Manage events            |
| `/admin/users`    | Admin     | Manage users             |

## Setup & Run

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   ```env
   VITE_API_URL=/api
   ```

   For local dev, the Vite proxy in `vite.config.js` sends `/api` to your backend (default `http://localhost:7100`). No rewrite; backend expects `/api/user`, `/api/chat`, etc.

3. **Run dev server**

   ```bash
   npm run dev
   ```

   App runs at `http://localhost:3000`.

4. **Build for production**

   ```bash
   npm run build
   npm run preview   # optional: preview build
   ```

## Backend Alignment

- Auth: `apiClient` uses base `/api`; auth calls go to `/api/user/*` (login, signup, check-auth, etc.).
- Events: `eventsApi` in `src/api/endpoints/events.js` is ready for when you add event routes on the backend (e.g. `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/:id`).
- CORS: Backend should allow your frontend origin (e.g. `http://localhost:3000`) with `credentials: true` for cookie-based auth.

## Next Steps

- Add backend event CRUD and wire `eventsApi` and Events/EventDetail pages.
- Implement booking flow and My Bookings page.
- Add notifications API and Notifications page.
- Build admin event form (create/edit) and admin user list.
- Add categories API if categories are stored in backend and used in filters.
