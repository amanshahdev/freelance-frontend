# FreelanceHub — Frontend

React.js frontend for the FreelanceHub freelance marketplace. Connects to the Express/MongoDB backend API.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Folder Structure

```
src/
├── index.js                    # React entry point
├── index.css                   # Global design system (CSS variables, utilities)
├── App.js                      # Router, route guards, Toaster setup
│
├── context/
│   └── AuthContext.js          # Global auth state (user, login, logout, updateUser)
│
├── services/
│   └── api.js                  # Axios instance + all API call functions
│
├── components/
│   ├── Navbar.js / .css        # Responsive nav with role-aware links + dropdown
│   ├── AvatarPlaceholder.js    # Initials avatar with deterministic colour
│   ├── JobCard.js              # Reusable job listing card
│   └── SharedComponents.js     # StatCard, PageHeader, Pagination, EmptyState,
│                               # LoadingSpinner, DashboardLayout, ConfirmModal
│
└── pages/
    ├── LandingPage.js / .css   # Public home — hero, categories, how-it-works
    ├── LoginPage.js            # Auth: login form
    ├── SignupPage.js           # Auth: signup with role selector
    ├── AuthPages.css           # Shared auth page styles
    ├── ClientDashboard.js      # Client: stats, recent jobs, quick actions
    ├── FreelancerDashboard.js  # Freelancer: stats, applications, fresh jobs
    ├── JobsPage.js             # Public: job board with search + filter panel
    ├── JobDetailPage.js        # Public: single job + inline apply form
    ├── CreateJobPage.js        # Client: multi-section job creation form
    ├── EditJobPage.js          # Client: pre-populated job edit form
    ├── MyJobsPage.js           # Client: paginated own jobs with management actions
    ├── ApplicationsPage.js     # Freelancer: all applications with withdraw
    ├── JobApplicantsPage.js    # Client: view + shortlist/accept/reject applicants
    ├── ProfilePage.js          # Public: any user's profile with stats + portfolio
    ├── EditProfilePage.js      # Protected: edit own profile, skills, portfolio, password
    ├── FreelancersPage.js      # Public: browse + search freelancers
    └── NotFoundPage.js         # 404
```

## Design System

- **Theme:** Dark editorial — `#0A0A0F` base, `#F59E0B` amber accent
- **Fonts:** DM Serif Display (headings) + DM Sans (body)
- **Variables:** All colours/sizes in `index.css` `:root`
- **Components:** Cards, badges, buttons, form inputs, spinners — all consistent

## Tech Stack

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` v6 | Client-side routing |
| `axios` | HTTP client with interceptors |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Icon set (Feather icons) |
| `date-fns` | Date formatting |

## Key Patterns

### Protected Routes
```jsx
// In App.js
<ProtectedRoute role="client">
  <CreateJobPage />
</ProtectedRoute>
```
- `ProtectedRoute` — redirects to `/login` if unauthenticated
- `role` prop — redirects to correct dashboard if wrong role
- `PublicRoute` — redirects authenticated users away from login/signup

### API Calls
```js
// All API functions in services/api.js
const res = await jobAPI.create(payload);
const res = await applicationAPI.apply({ jobId, coverLetter, proposedRate, estimatedDays });
```

### Auth Flow
1. User signs up/logs in → backend returns `{ token, user }`
2. `AuthContext.login(token, user)` saves both to `localStorage`
3. Axios request interceptor attaches `Authorization: Bearer <token>` automatically
4. Axios response interceptor auto-logouts on 401
5. On app reload, `AuthContext` verifies token via `GET /auth/me`

## Scripts

```bash
npm start       # Development server
npm run build   # Production build → /build folder
npm test        # Run tests
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + Render + Atlas guide.
