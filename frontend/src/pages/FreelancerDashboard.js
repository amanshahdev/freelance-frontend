/**
 * pages/FreelancerDashboard.js
 * Dashboard for authenticated freelancers: stats, recent applications, job browsing.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  jobAPI,
  applicationAPI,
  userAPI,
  getErrorMessage,
} from "../services/api";
import {
  DashboardLayout,
  StatCard,
  PageHeader,
  LoadingSpinner,
  EmptyState,
} from "../components/SharedComponents";
import {
  FiSend,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLOR = {
  pending: "badge-muted",
  shortlisted: "badge-amber",
  accepted: "badge-green",
  rejected: "badge-red",
  withdrawn: "badge-muted",
};

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [appsRes, jobsRes, statsRes] = await Promise.all([
          applicationAPI.getMyApplications({ limit: 5 }),
          jobAPI.getAll({ limit: 4, status: "open" }),
          userAPI.getUserStats(user._id),
        ]);
        setApps(appsRes.data.applications);
        setJobs(jobsRes.data.jobs);
        setStats(statsRes.data.stats);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]);

  if (loading)
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-enter">
        <PageHeader
          title={`Welcome back, ${user.name.split(" ")[0]} ✦`}
          subtitle="Track your applications and discover new opportunities"
          action={
            <Link to="/jobs" className="btn btn-primary">
              <FiSearch size={16} /> Find Jobs
            </Link>
          }
        />

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <StatCard
            icon={<FiSend size={22} />}
            label="Total Applied"
            value={stats?.totalApplications ?? 0}
            accent
          />
          <StatCard
            icon={<FiCheckCircle size={22} />}
            label="Accepted"
            value={stats?.acceptedApplications ?? 0}
          />
          <StatCard
            icon={<FiClock size={22} />}
            label="Pending"
            value={stats?.pendingApplications ?? 0}
          />
        </div>

        {/* Quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {[
            {
              label: "Browse All Jobs",
              desc: "Find your next opportunity",
              to: "/jobs",
              primary: true,
            },
            {
              label: "My Applications",
              desc: "Track your proposals",
              to: "/my-applications",
            },
            {
              label: "Edit Profile",
              desc: "Update skills & portfolio",
              to: "/profile/edit",
            },
          ].map((a) => (
            <Link key={a.to} to={a.to} style={{ textDecoration: "none" }}>
              <div
                className="card card-hover"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: a.primary ? "var(--amber-dim)" : undefined,
                  borderColor: a.primary ? "rgba(20,184,166,0.35)" : undefined,
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: a.primary ? "var(--amber)" : "var(--text-primary)",
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginTop: 4,
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
                <FiArrowRight
                  size={18}
                  style={{
                    color: a.primary ? "var(--amber)" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Recent applications */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
            Recent Applications
          </h2>
          <Link to="/my-applications" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>

        {apps.length === 0 ? (
          <EmptyState
            icon="📨"
            title="No applications yet"
            subtitle="Browse open jobs and submit your first proposal."
            action={
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            }
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 40,
            }}
          >
            {apps.map((app) => (
              <div
                key={app._id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.job?.title || "Job"}
                    </div>
                  </Link>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {app.job?.client?.name} · Applied{" "}
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--amber)",
                      fontSize: 15,
                    }}
                  >
                    ${app.proposedRate}
                  </span>
                  <span
                    className={`badge ${STATUS_COLOR[app.status] || "badge-muted"}`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended open jobs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
            Fresh Opportunities
          </h2>
          <Link to="/jobs" className="btn btn-ghost btn-sm">
            See all →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon="💼"
            title="No jobs at the moment"
            subtitle="Check back soon for new opportunities."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 16,
            }}
          >
            {jobs.map((job) => (
              <div
                key={job._id}
                className="card card-hover"
                style={{ cursor: "default" }}
              >
                <Link
                  to={`/jobs/${job._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 17,
                      marginBottom: 8,
                      color: "var(--text-primary)",
                    }}
                  >
                    {job.title}
                  </h3>
                </Link>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="badge badge-muted">{job.category}</span>
                  <span className="badge badge-muted">{job.location}</span>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--amber)",
                    fontWeight: 600,
                  }}
                >
                  ${job.budgetMin}–${job.budgetMax}
                </div>
                <Link
                  to={`/jobs/${job._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 16, justifyContent: "center" }}
                >
                  View & Apply
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
