# Freelance Marketplace Frontend

This is the React frontend for a freelance marketplace platform where clients can post jobs and freelancers can browse opportunities, apply, and manage their work activity. The app uses role-based navigation so each user sees the right dashboard and pages for their account type.

## What the app does

- Public visitors can explore the landing page, job listings, freelancer profiles, and job details.
- Clients can create, edit, and manage jobs, review applicants, and view their posted work.
- Freelancers can browse jobs, apply to opportunities, and track their applications.
- Authenticated users can update their profile and password.

## Tech Stack

- React 18
- React Router for page routing
- Axios for API requests
- React Hot Toast for notifications
- React Icons for UI icons
- date-fns for date formatting

## Main Frontend Structure

- `src/App.js` sets up routing, protected routes, and public routes.
- `src/context/AuthContext.js` manages the logged-in user session.
- `src/services/api.js` centralizes API calls and attaches the auth token.
- `src/pages/` contains the page-level screens such as dashboards, job pages, profile pages, and auth pages.
- `src/components/` contains reusable UI pieces such as the navbar, job cards, shared dashboard components, and placeholders.

## Key UI Components

- `Navbar` for top-level navigation.
- `JobCard` for displaying job listings.
- `SharedComponents` for reusable elements like stat cards, page headers, loading states, empty states, pagination, and modals.
- `AvatarPlaceholder` for default user avatars.

## Running Locally

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm start
```

The app runs on `http://localhost:3000` by default.

## Backend Connection

The frontend expects the backend API to be available while you use login, signup, dashboards, jobs, and applications.

- For local development, the React app uses the proxy configured in `package.json`.
- For deployment, set `REACT_APP_API_URL` to your backend API base URL.

## Available Scripts

- `npm start` - start the development server
- `npm run build` - create a production build
- `npm test` - run the test runner
- `npm run eject` - eject from Create React App

## Notes

- This project stores session data in the browser so authenticated users remain signed in across refreshes.
- The frontend is designed to work with the matching backend API in the parent repository.
