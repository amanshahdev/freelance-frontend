/**
 * App.js
 *
 * WHAT: Root component. Wires up AuthProvider, React Router,
 *       and maps every route to its page component.
 * HOW:  ProtectedRoute wrapper checks auth + role before rendering children.
 *       PublicRoute redirects authenticated users away from login/signup.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CreateJobPage from "./pages/CreateJobPage";
import EditJobPage from "./pages/EditJobPage";
import MyJobsPage from "./pages/MyJobsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import FreelancersPage from "./pages/FreelancersPage";
import NotFoundPage from "./pages/NotFoundPage";

// ── Route guards ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div className="spinner spinner-lg" />
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return (
      <Navigate
        to={
          user.role === "client" ? "/dashboard/client" : "/dashboard/freelancer"
        }
        replace
      />
    );
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user)
    return (
      <Navigate
        to={
          user.role === "client" ? "/dashboard/client" : "/dashboard/freelancer"
        }
        replace
      />
    );
  return children;
};

// ── App ──────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/jobs" element={<JobsPage />} />
    <Route path="/jobs/:id" element={<JobDetailPage />} />
    <Route path="/freelancers" element={<FreelancersPage />} />
    <Route path="/profile/:id" element={<ProfilePage />} />

    {/* Auth */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      }
    />

    {/* Client */}
    <Route
      path="/dashboard/client"
      element={
        <ProtectedRoute role="client">
          <ClientDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/create"
      element={
        <ProtectedRoute role="client">
          <CreateJobPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/:id/edit"
      element={
        <ProtectedRoute role="client">
          <EditJobPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-jobs"
      element={
        <ProtectedRoute role="client">
          <MyJobsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/:id/applicants"
      element={
        <ProtectedRoute role="client">
          <JobApplicantsPage />
        </ProtectedRoute>
      }
    />

    {/* Freelancer */}
    <Route
      path="/dashboard/freelancer"
      element={
        <ProtectedRoute role="freelancer">
          <FreelancerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-applications"
      element={
        <ProtectedRoute role="freelancer">
          <ApplicationsPage />
        </ProtectedRoute>
      }
    />

    {/* Shared protected */}
    <Route
      path="/profile/edit"
      element={
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      }
    />

    {/* 404 */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A26",
              color: "#F0EEE8",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#14B8A6", secondary: "#0A0A0F" },
            },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
