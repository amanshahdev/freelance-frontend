# Freelance Marketplace — Backend API

A complete, production-ready REST API for a Fiverr-like freelance marketplace built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure](#2-folder-structure)
3. [Dependencies](#3-dependencies)
4. [Environment Variables](#4-environment-variables)
5. [How to Run Locally](#5-how-to-run-locally)
6. [File-by-File Explanation](#6-file-by-file-explanation)
7. [API Reference & Testing Guide](#7-api-reference--testing-guide)
8. [Security Overview](#8-security-overview)
9. [Database Design](#9-database-design)

---

## 1. Project Overview

This backend powers a two-sided freelance marketplace:

| Actor        | Core Capabilities |
|-------------|-------------------|
| **Client**  | Post jobs, edit/delete their jobs, view applicants, shortlist / accept / reject applicants |
| **Freelancer** | Browse & search jobs, apply with a proposal, track application statuses, manage portfolio |

Authentication is JWT-based with bcrypt password hashing.  
All routes follow REST conventions under `/api/*`.

---

## 2. Folder Structure

```
backend/
├── server.js                    # App bootstrap & HTTP server
├── package.json
├── .env.example                 # Environment variable template
├── .gitignore
│
├── config/
│   └── db.js                    # MongoDB connection + lifecycle hooks
│
├── models/
│   ├── User.js                  # User schema (client & freelancer)
│   ├── Job.js                   # Job posting schema
│   └── Application.js           # Job application schema
│
├── controllers/
│   ├── authController.js        # signup, login, getMe, changePassword
│   ├── userController.js        # profile CRUD, freelancer search, portfolio
│   ├── jobController.js         # job CRUD + search/filter
│   └── applicationController.js # apply, view, status updates, withdraw
│
├── routes/
│   ├── authRoutes.js            # /api/auth/*
│   ├── userRoutes.js            # /api/users/*
│   ├── jobRoutes.js             # /api/jobs/*
│   └── applicationRoutes.js    # /api/applications/*
│
├── middleware/
│   ├── authMiddleware.js        # JWT protect, requireRole, attachUser
│   ├── errorMiddleware.js       # notFound (404) + global errorHandler
│   └── validate.js              # express-validator result checker
│
└── utils/
    ├── generateToken.js         # JWT signing helper
    └── pagination.js            # parsePaginationParams + buildPaginationMeta
```

---

## 3. Dependencies

### Production

| Package | Purpose |
|---------|---------|
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM with schema validation |
| `bcryptjs` | Password hashing (cost factor 12) |
| `jsonwebtoken` | JWT sign & verify |
| `express-validator` | Declarative request validation |
| `express-rate-limit` | Brute-force / DDoS protection |
| `helmet` | Secure HTTP headers |
| `cors` | Cross-Origin Resource Sharing |
| `morgan` | HTTP request logging |
| `dotenv` | Environment variable loading |

### Development

| Package | Purpose |
|---------|---------|
| `nodemon` | Auto-restart on file changes |
| `jest` | Test runner |
| `supertest` | HTTP integration testing |

---

## 4. Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` / `production` / `test` |
| `PORT` | No | HTTP port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string or local URI |
| `JWT_SECRET` | Yes | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CLIENT_URL` | No | Allowed CORS origin (default: `*`) |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. How to Run Locally

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster **or** MongoDB running locally

### Steps

```bash
# 1. Clone / navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — at minimum set MONGO_URI and JWT_SECRET

# 4. Start development server (auto-restarts on change)
npm run dev

# 5. Or start production server
npm start
```

The API will be available at: `http://localhost:5000`  
Health check: `GET http://localhost:5000/health`

---

## 6. File-by-File Explanation

### `server.js`
**What:** Entry point. Boots Express, applies global middleware, registers all routers, and starts the HTTP server.  
**Why:** Centralised bootstrap makes startup order explicit. The DB connection awaits before `.listen()`, so the server never accepts traffic before Mongoose is ready.

### `config/db.js`
**What:** Mongoose connection logic with retry hooks and graceful shutdown on SIGINT/SIGTERM.  
**Why:** Isolating DB setup means switching from Atlas to a replica set requires changing one file.

### `models/User.js`
**What:** Mongoose schema for all users (both roles). Includes:
- bcrypt pre-save hook (cost factor 12, ~300 ms per hash — strong against brute force)
- `comparePassword()` instance method
- `select: false` on password — never accidentally returned
- Text index on name, bio, skills for freelancer search

### `models/Job.js`
**What:** Job posting schema with category enum (15 categories), budget range, status lifecycle, and a virtual `applicationCount`.  
**Why:** Enforcing categories and valid statuses in the schema prevents dirty data from controllers.

### `models/Application.js`
**What:** Application schema with a compound unique index on `(job, freelancer)`.  
**Why:** The unique index is the definitive guard against duplicate applications — even under concurrent requests.

### `middleware/authMiddleware.js`
**What:** Three exported functions:
- `protect` — validates JWT, fetches a lean user doc, attaches to `req.user`
- `requireRole(roles)` — factory that checks `req.user.role` against allowed values
- `attachUser` — optional auth for public routes that personalise responses  
**Why:** Declarative role guards in route files rather than if-statements in controllers.

### `middleware/errorMiddleware.js`
**What:** `notFound` (404) and `errorHandler` (global error formatter).  
**Why:** Uniform JSON error responses across Mongoose validation errors, cast errors, JWT errors, and generic exceptions. Development mode includes stack traces.

### `middleware/validate.js`
**What:** Reads `validationResult(req)` from express-validator and short-circuits with a 422 if errors exist.  
**Why:** Keeps controllers free of input-checking boilerplate.

### `controllers/authController.js`
**What:** `signup`, `login`, `getMe`, `changePassword`.  
**Key decisions:**
- Login uses a generic "Invalid email or password" message to prevent email enumeration.
- `select: false` on password means we must explicitly `.select('+password')` during login.

### `controllers/userController.js`
**What:** Profile CRUD, freelancer/client listings, portfolio management, stats.  
**Key decisions:**
- `deleteAccount` is a soft delete (`isActive: false`) to preserve referential integrity.
- `updateProfile` uses an allowlist of fields — role/email/password cannot be changed here.

### `controllers/jobController.js`
**What:** Full CRUD plus advanced search with text index, multi-filter, and aggregation for application counts.  
**Key decisions:**
- `deleteJob` soft-deletes and sets status to `cancelled`.
- Clients cannot set status to `completed` (that should come from a contract/delivery flow).

### `controllers/applicationController.js`
**What:** Apply, view applicants (client), view own applications (freelancer), status transitions, withdraw.  
**Key decisions:**
- Accepting an application auto-transitions the job to `in_progress`.
- Status machine: `pending → shortlisted | accepted | rejected`; withdrawn is terminal.

### `utils/generateToken.js`
**What:** Thin wrapper around `jwt.sign()` that encodes `id`, `email`, and `role`.  
**Why:** Role in the token lets middleware make quick role checks without a DB query on every request.

### `utils/pagination.js`
**What:** `parsePaginationParams` (safe defaults + caps) and `buildPaginationMeta` (total, pages, hasNext, hasPrev).  
**Why:** Consistent pagination across all listing endpoints.

---

## 7. API Reference & Testing Guide

Base URL: `http://localhost:5000/api`  
All request/response bodies are JSON.  
Protected routes require: `Authorization: Bearer <token>`

---

### AUTH — `/api/auth`

#### POST `/api/auth/signup`
Register a new user.

**Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "Secret123",
  "role": "client"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "<jwt>",
  "user": { "_id": "...", "name": "Alice Johnson", "role": "client", ... }
}
```

---

#### POST `/api/auth/login`
Authenticate an existing user.

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "Secret123"
}
```
**Response 200:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "<jwt>",
  "user": { ... }
}
```

---

#### GET `/api/auth/me` 🔒
Returns the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

---

#### PUT `/api/auth/change-password` 🔒
Change own password.

**Body:**
```json
{
  "currentPassword": "Secret123",
  "newPassword": "NewPass456"
}
```

---

### USERS — `/api/users`

#### GET `/api/users/freelancers`
Browse all active freelancers.

**Query params:**
| Param | Type | Example |
|-------|------|---------|
| `page` | number | `1` |
| `limit` | number | `10` |
| `search` | string | `react developer` |
| `skills` | string | `React,Node.js` |
| `location` | string | `New York` |
| `minRate` | number | `20` |
| `maxRate` | number | `100` |
| `sort` | string | `rate_asc` / `rate_desc` / `name_asc` |

---

#### GET `/api/users/:id`
Fetch any user's public profile.

---

#### GET `/api/users/:id/stats`
Fetch public stats (jobs posted for clients; applications sent for freelancers).

---

#### PUT `/api/users/profile` 🔒
Update own profile. Allowed fields: `name`, `bio`, `skills`, `profilePic`, `location`, `hourlyRate`.

**Body (any subset):**
```json
{
  "bio": "Senior React developer with 5 years experience",
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRate": 75,
  "location": "Remote"
}
```

---

#### DELETE `/api/users/account` 🔒
Soft-deactivates the authenticated user's account.

---

#### POST `/api/users/portfolio` 🔒 (freelancer only)
Add a portfolio item.

**Body:**
```json
{
  "title": "E-commerce Platform",
  "url": "https://github.com/alice/ecom",
  "description": "Full-stack React + Node.js shop"
}
```

---

#### DELETE `/api/users/portfolio/:itemId` 🔒 (freelancer only)
Remove a portfolio item by its sub-document ID.

---

### JOBS — `/api/jobs`

#### GET `/api/jobs/categories`
Returns the list of valid job categories.

---

#### GET `/api/jobs`
Browse/search all open jobs.

**Query params:**
| Param | Type | Example |
|-------|------|---------|
| `page` | number | `1` |
| `limit` | number | `10` |
| `search` | string | `react dashboard` |
| `category` | string | `Web Development` |
| `status` | string | `open` |
| `location` | string | `remote` |
| `experienceLevel` | string | `intermediate` |
| `budgetType` | string | `fixed` |
| `minBudget` | number | `500` |
| `maxBudget` | number | `5000` |
| `skills` | string | `React,MongoDB` |
| `sort` | string | `newest` / `oldest` / `budget_asc` / `budget_desc` |

**Response 200:**
```json
{
  "success": true,
  "pagination": { "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false },
  "jobs": [ { "_id": "...", "title": "...", "applicationCount": 3, ... } ]
}
```

---

#### POST `/api/jobs` 🔒 (client only)
Create a new job posting.

**Body:**
```json
{
  "title": "Build a React Dashboard",
  "description": "We need an experienced React developer to build an analytics dashboard with charts, filters, and CSV export. The design is ready in Figma.",
  "category": "Web Development",
  "skills": ["React", "TypeScript", "Recharts"],
  "budgetType": "fixed",
  "budgetMin": 500,
  "budgetMax": 1500,
  "deadline": "2025-03-01T00:00:00.000Z",
  "location": "remote",
  "experienceLevel": "intermediate"
}
```

---

#### GET `/api/jobs/:id`
Fetch a single job with full details and application count.

---

#### PUT `/api/jobs/:id` 🔒 (client — must own job)
Update a job. Send only the fields you want to change.

**Body (example):**
```json
{
  "budgetMax": 2000,
  "status": "in_progress"
}
```

---

#### DELETE `/api/jobs/:id` 🔒 (client — must own job)
Soft-delete a job (sets `isActive: false`, `status: cancelled`).

---

#### GET `/api/jobs/my-jobs` 🔒 (client only)
Paginated list of the authenticated client's own job postings.

**Query:** `page`, `limit`, `status`

---

### APPLICATIONS — `/api/applications`

#### POST `/api/applications` 🔒 (freelancer only)
Submit an application to a job.

**Body:**
```json
{
  "jobId": "<job_object_id>",
  "coverLetter": "Hi, I am an experienced React developer with 5 years of professional experience. I have built several dashboards with Recharts and am confident I can deliver this project within your budget and timeline. I would love to discuss further.",
  "proposedRate": 1200,
  "estimatedDays": 14
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Application submitted successfully.",
  "application": { "_id": "...", "status": "pending", ... }
}
```

---

#### GET `/api/applications/my-applications` 🔒 (freelancer only)
Returns the authenticated freelancer's own applications with full job + client details.

**Query:** `page`, `limit`, `status`

---

#### GET `/api/applications/job/:jobId` 🔒 (client — must own job)
Returns all applications for a specific job with freelancer profiles.

**Query:** `page`, `limit`, `status`

**Response 200:**
```json
{
  "success": true,
  "job": { "_id": "...", "title": "Build a React Dashboard" },
  "pagination": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 },
  "applications": [
    {
      "_id": "...",
      "status": "pending",
      "proposedRate": 1200,
      "estimatedDays": 14,
      "coverLetter": "...",
      "freelancer": { "name": "Bob Smith", "skills": ["React"], "hourlyRate": 75 }
    }
  ]
}
```

---

#### GET `/api/applications/:id` 🔒 (client or owning freelancer)
Fetch a single application with full population.

---

#### PATCH `/api/applications/:id/status` 🔒 (client — must own the related job)
Update application status in the hiring pipeline.

**Body:**
```json
{
  "status": "shortlisted",
  "clientNote": "Strong profile, scheduling an interview."
}
```
Valid status values: `shortlisted`, `accepted`, `rejected`

> When status is set to `accepted`, the related job is automatically moved to `in_progress`.

---

#### PATCH `/api/applications/:id/withdraw` 🔒 (freelancer — must own application)
Withdraw a `pending` or `shortlisted` application.

**Response 200:**
```json
{
  "success": true,
  "message": "Application withdrawn successfully."
}
```

---

### Error Response Format

All error responses follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    { "field": "email", "message": "Enter a valid email address" }
  ]
}
```

`errors` array is only present for validation failures (422).

---

## 8. Security Overview

| Threat | Mitigation |
|--------|------------|
| Brute-force login | Rate limiter: 20 req / 15 min on `/api/auth/*` |
| General DDoS | Rate limiter: 200 req / 15 min on all `/api/*` |
| Insecure HTTP headers | `helmet` middleware |
| Cross-Origin attacks | `cors` configured to `CLIENT_URL` |
| Password exposure | bcrypt cost-12 hash; `select: false` on schema |
| Token forgery | JWT signed with `JWT_SECRET`; verified on every protected request |
| Expired tokens | `TokenExpiredError` caught and returned as 401 |
| Unauthorised access | `requireRole()` guards on all sensitive routes |
| Injection via Mongoose | Mongoose parameterised queries; no raw string interpolation |
| Oversized payloads | `express.json({ limit: '10mb' })` |
| Email enumeration | Generic "Invalid email or password" on login failure |

---

## 9. Database Design

### Relationships

```
User (client) ──< Job ──< Application >── User (freelancer)
```

- One client can post many jobs (`Job.client → User`)
- One job can receive many applications (`Application.job → Job`)
- One freelancer can submit many applications (`Application.freelancer → User`)
- A freelancer can only apply to a given job **once** (compound unique index)

### Schema Summary

**User**
```
_id, name, email (unique), password (select:false), role, bio,
skills[], profilePic, location, hourlyRate, portfolio[], isActive,
createdAt, updatedAt
```

**Job**
```
_id, title, description, client (→User), category, skills[],
budgetType, budgetMin, budgetMax, deadline, status, location,
experienceLevel, isActive, createdAt, updatedAt
```

**Application**
```
_id, job (→Job), freelancer (→User), coverLetter, proposedRate,
estimatedDays, status, clientNote, attachments[], createdAt, updatedAt
[unique index: (job, freelancer)]
```

### Indexes

| Collection | Index | Purpose |
|-----------|-------|---------|
| User | `email` (unique) | Login lookup |
| User | text on `name, bio, skills` | Freelancer search |
| User | `role, createdAt` | Listing filter |
| Job | text on `title, description, skills` | Job search |
| Job | `status, createdAt` | Browse open jobs |
| Job | `category, experienceLevel, budgetMin/Max` | Multi-filter |
| Application | `(job, freelancer)` unique | Duplicate prevention |
| Application | `job`, `freelancer`, `status` | Fast lookups |
