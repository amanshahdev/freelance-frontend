# 🚀 Full Deployment Guide — FreelanceHub

This guide covers deploying the complete stack for free:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend**  → [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://cloud.mongodb.com)

---

## Table of Contents
1. [Local Development Setup](#1-local-development-setup)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Deploy Backend to Render](#3-deploy-backend-to-render)
4. [Deploy Frontend to Vercel](#4-deploy-frontend-to-vercel)
5. [Connect Frontend ↔ Backend](#5-connect-frontend--backend)
6. [Fix CORS Issues](#6-fix-cors-issues)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Local Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm run dev        # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local already points to http://localhost:5000/api
npm start          # runs on http://localhost:3000
```

> Both must run simultaneously. Open two terminal windows.

---

## 2. MongoDB Atlas Setup

### Step 1 — Create a free cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up / Log in
2. Click **"Build a Database"** → Choose **Free (M0 Sandbox)**
3. Pick a cloud provider (AWS recommended) and region closest to you
4. Name your cluster (e.g. `freelance-marketplace`) → Click **Create**

### Step 2 — Create a database user
1. Left sidebar → **Security → Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Enter a username (e.g. `appuser`) and a strong password
4. Under "Built-in Role" → select **Read and write to any database**
5. Click **Add User**

### Step 3 — Whitelist IP addresses
1. Left sidebar → **Security → Network Access** → **Add IP Address**
2. For development: click **"Add Current IP Address"**
3. For production (Render): click **"Allow Access from Anywhere"** → `0.0.0.0/0`
   - ⚠️ This is required because Render uses dynamic IPs
4. Click **Confirm**

### Step 4 — Get your connection string
1. Left sidebar → **Deployment → Database** → Click **"Connect"** on your cluster
2. Choose **"Drivers"** → Driver: **Node.js**, Version: **5.5 or later**
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://appuser:<password>@freelance-marketplace.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database user password
5. Add your database name before `?`:
   ```
   mongodb+srv://appuser:yourpassword@freelance-marketplace.xxxxx.mongodb.net/freelance_marketplace?retryWrites=true&w=majority
   ```
6. Save this — it's your `MONGO_URI`

---

## 3. Deploy Backend to Render

### Step 1 — Push backend to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/freelance-backend.git
git push -u origin main
```

### Step 2 — Create Render Web Service
1. Go to [render.com](https://render.com) → Sign up / Log in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → Select your backend repository
4. Configure the service:
   | Setting | Value |
   |---------|-------|
   | **Name** | `freelance-marketplace-api` |
   | **Region** | Closest to your users |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Plan** | Free |

### Step 3 — Set environment variables on Render
Click **"Advanced"** or go to your service → **Environment** tab, and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random string (generate below) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Your Vercel frontend URL (add after deploying frontend) |
| `PORT` | `10000` (Render uses this by default) |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4 — Deploy
1. Click **"Create Web Service"**
2. Render will build and deploy automatically (takes 2–5 minutes)
3. Your API will be live at: `https://freelance-marketplace-api.onrender.com`
4. Test it: `https://freelance-marketplace-api.onrender.com/health`

> **Free tier note:** Render free services spin down after 15 min of inactivity.
> First request after sleep takes ~30 seconds. Upgrade to Starter ($7/mo) to avoid this.

---

## 4. Deploy Frontend to Vercel

### Step 1 — Push frontend to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial frontend"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/freelance-frontend.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up / Log in with GitHub
2. Click **"Add New Project"** → Import your frontend repository
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Create React App` |
   | **Root Directory** | `./` (leave as is) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `build` |

### Step 3 — Set environment variables on Vercel
In the project settings → **Environment Variables**, add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://freelance-marketplace-api.onrender.com/api` |

### Step 4 — Deploy
1. Click **"Deploy"**
2. Vercel builds and deploys (takes 1–3 minutes)
3. Your frontend is live at: `https://freelance-marketplace.vercel.app`

### Step 5 — Configure React Router on Vercel
Vercel needs a rewrite rule so React Router works on page refresh.
Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
Commit and push — Vercel redeploys automatically.

---

## 5. Connect Frontend ↔ Backend

### Update CORS on backend
After getting your Vercel URL, go to Render → your service → **Environment** tab:
- Set `CLIENT_URL` = `https://your-app.vercel.app`

Then trigger a **manual redeploy** on Render (top right → "Manual Deploy").

### Update API URL on frontend
In Vercel → your project → **Settings → Environment Variables**:
- Set `REACT_APP_API_URL` = `https://freelance-marketplace-api.onrender.com/api`

Vercel redeploys automatically when env vars change.

---

## 6. Fix CORS Issues

If you see `CORS error` in the browser console:

### Check 1 — Backend CLIENT_URL
In `backend/server.js`, CORS is configured with:
```js
origin: process.env.CLIENT_URL || '*'
```
Ensure `CLIENT_URL` on Render exactly matches your Vercel URL (no trailing slash).

### Check 2 — Exact URL match
- ✅ `https://freelance-marketplace.vercel.app`
- ❌ `https://freelance-marketplace.vercel.app/`  ← trailing slash breaks it
- ❌ `http://freelance-marketplace.vercel.app`    ← wrong protocol

### Check 3 — Multiple origins (custom domain + vercel.app)
If you have a custom domain AND the `.vercel.app` URL, update `server.js`:
```js
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://www.yourdomain.com',
  'https://freelance-marketplace.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS: Not allowed'));
  },
  credentials: true,
}));
```

### Check 4 — Preflight requests
If OPTIONS requests fail, add this before routes in `server.js`:
```js
app.options('*', cors());
```

---

## 7. Environment Variables Reference

### Backend (`.env` / Render)
| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `10000` |
| `MONGO_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/db?...` |
| `JWT_SECRET` | ✅ | `a64-character-random-hex-string` |
| `JWT_EXPIRES_IN` | ✅ | `7d` |
| `CLIENT_URL` | ✅ | `https://your-app.vercel.app` |

### Frontend (`.env.local` / Vercel)
| Variable | Required | Example |
|----------|----------|---------|
| `REACT_APP_API_URL` | ✅ | `https://freelance-marketplace-api.onrender.com/api` |

---

## 8. Troubleshooting

### "Cannot connect to server" on frontend
- Check `REACT_APP_API_URL` is set correctly in Vercel env vars
- Make sure the Render backend is running (visit `/health` endpoint)
- Check browser Network tab for the actual request URL

### Backend returns 500 on Render
- Check Render logs: Service → **Logs** tab
- Verify `MONGO_URI` is correct and Atlas IP is whitelisted (`0.0.0.0/0`)
- Verify `JWT_SECRET` is set

### MongoDB connection fails
- Ensure `0.0.0.0/0` is in Atlas Network Access (Render uses dynamic IPs)
- Verify the database user password has no special URL characters (use alphanumeric)
- Check `MONGO_URI` includes the database name before `?`

### React Router 404 on Vercel refresh
- Add `vercel.json` with the rewrites rule (see Step 5 above)

### JWT errors after deploy
- Ensure `JWT_SECRET` is identical across all backend deployments
- Tokens signed with one secret cannot be verified with another

### Free tier limitations
| Platform | Limitation | Fix |
|----------|-----------|-----|
| Render Free | Spins down after 15 min idle | Upgrade to Starter ($7/mo) |
| MongoDB Atlas Free | 512MB storage, shared cluster | Upgrade to M10+ |
| Vercel Free | 100GB bandwidth/month | Upgrade to Pro |

---

## Quick Deploy Checklist

```
[ ] MongoDB Atlas cluster created
[ ] Database user created with read/write access
[ ] IP whitelist set to 0.0.0.0/0
[ ] MONGO_URI copied and tested
[ ] Backend pushed to GitHub
[ ] Render web service created with all env vars
[ ] Backend health check passes: GET /health
[ ] Frontend pushed to GitHub
[ ] REACT_APP_API_URL set in Vercel
[ ] vercel.json added for React Router
[ ] CLIENT_URL updated on Render with Vercel URL
[ ] Test signup → login → post job → apply flow end-to-end
```
