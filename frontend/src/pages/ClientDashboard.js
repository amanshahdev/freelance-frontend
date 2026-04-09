/**
 * pages/ClientDashboard.js
 * Dashboard for authenticated clients: stats, recent jobs, quick actions.
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { jobAPI, userAPI, getErrorMessage } from "../services/api";
import {
  DashboardLayout,
  StatCard,
  PageHeader,
  LoadingSpinner,
  EmptyState,
  ConfirmModal,
} from "../components/SharedComponents";
import JobCard from "../components/JobCard";
import {
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, jobId: null });

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          jobAPI.getMyJobs({ limit: 5 }),
          userAPI.getUserStats(user._id),
        ]);
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

  const handleDelete = async () => {
    try {
      await jobAPI.remove(deleteModal.jobId);
      setJobs((j) => j.filter((x) => x._id !== deleteModal.jobId));
      toast.success("Job deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteModal({ open: false, jobId: null });
    }
  };

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
          title={`Good day, ${user.name.split(" ")[0]} ✦`}
          subtitle="Here's an overview of your hiring activity"
          action={
            <Link to="/jobs/create" className="btn btn-primary">
              <FiPlus size={16} /> Post New Job
            </Link>
          }
        />

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <StatCard
            icon={<FiBriefcase size={22} />}
            label="Total Jobs Posted"
            value={stats?.totalJobs ?? 0}
            accent
          />
          <StatCard
            icon={<FiUsers size={22} />}
            label="Currently Open"
            value={stats?.openJobs ?? 0}
          />
          <StatCard
            icon={<FiCheckCircle size={22} />}
            label="Completed"
            value={stats?.completedJobs ?? 0}
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
              label: "Hire Talent",
              desc: "Browse freelancers to start a new hire",
              to: "/freelancers",
            },
            {
              label: "Post a Job",
              desc: "Find the talent you need",
              to: "/jobs/create",
              primary: true,
            },
            {
              label: "My Job Listings",
              desc: "Manage all your jobs",
              to: "/my-jobs",
            },
          ].map((a) => (
            <Link key={a.to} to={a.to} style={{ textDecoration: "none" }}>
              <div
                className={`card card-hover`}
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

        {/* Recent Jobs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
            Recent Jobs
          </h2>
          <Link to="/my-jobs" className="btn btn-ghost btn-sm">
            View all →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No jobs posted yet"
            subtitle="Post your first job and start finding great talent."
            action={
              <Link to="/jobs/create" className="btn btn-primary">
                <FiPlus size={15} /> Post Your First Job
              </Link>
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                showActions
                onEdit={() => navigate(`/jobs/${job._id}/edit`)}
                onDelete={() => setDeleteModal({ open: true, jobId: job._id })}
                onViewApplicants={() => navigate(`/jobs/${job._id}/applicants`)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title="Delete this job?"
        message="This action cannot be undone. The job will be permanently removed and all applications will be affected."
        confirmLabel="Yes, Delete"
        dangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, jobId: null })}
      />
    </DashboardLayout>
  );
}
