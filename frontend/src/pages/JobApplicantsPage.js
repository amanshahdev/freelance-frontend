/**
 * pages/JobApplicantsPage.js
 * Client-only: view all applicants for a specific job, update statuses.
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  DashboardLayout,
  PageHeader,
  LoadingSpinner,
  EmptyState,
} from "../components/SharedComponents";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import { applicationAPI, jobAPI, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  FiArrowLeft,
  FiStar,
  FiCheck,
  FiX,
  FiDollarSign,
  FiClock,
  FiExternalLink,
} from "react-icons/fi";

const STATUS_BADGE = {
  pending: { cls: "badge-muted", label: "Pending" },
  shortlisted: { cls: "badge-amber", label: "Shortlisted" },
  accepted: { cls: "badge-green", label: "Accepted" },
  rejected: { cls: "badge-red", label: "Rejected" },
  withdrawn: { cls: "badge-muted", label: "Withdrawn" },
};

const STATUS_TABS = ["all", "pending", "shortlisted", "accepted", "rejected"];

export default function JobApplicantsPage() {
  const { id: jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [noteModal, setNoteModal] = useState({
    open: false,
    appId: null,
    newStatus: null,
  });
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobAPI.getById(jobId),
          applicationAPI.getJobApplications(jobId),
        ]);
        const j = jobRes.data.job;
        if (j.client?._id !== user._id) {
          toast.error("Unauthorized");
          navigate("/my-jobs");
          return;
        }
        setJob(j);
        setApps(appsRes.data.applications);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/my-jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, user._id, navigate]);

  const openUpdateModal = (appId, newStatus) => {
    setNote("");
    setNoteModal({ open: true, appId, newStatus });
  };

  const handleStatusUpdate = async () => {
    const { appId, newStatus } = noteModal;
    setUpdating(appId);
    setNoteModal({ open: false, appId: null, newStatus: null });
    try {
      await applicationAPI.updateStatus(appId, {
        status: newStatus,
        clientNote: note,
      });
      setApps((prev) =>
        prev.map((a) =>
          a._id === appId ? { ...a, status: newStatus, clientNote: note } : a,
        ),
      );
      toast.success(`Applicant ${newStatus}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    status === "all" ? apps : apps.filter((a) => a.status === status);

  if (loading)
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading applicants…" />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="page-enter">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          <FiArrowLeft size={15} /> Back
        </button>

        <PageHeader
          title="Applicants"
          subtitle={
            job
              ? `${apps.length} applicant${apps.length !== 1 ? "s" : ""} for "${job.title}"`
              : ""
          }
          action={
            <Link to={`/jobs/${jobId}`} className="btn btn-secondary btn-sm">
              <FiExternalLink size={14} /> View Job
            </Link>
          }
        />

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "all"
                ? apps.length
                : apps.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${status === tab ? "var(--amber)" : "var(--border)"}`,
                  background:
                    status === tab ? "var(--amber-dim)" : "var(--bg-raised)",
                  color:
                    status === tab ? "var(--amber)" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  textTransform: "capitalize",
                }}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No applicants here"
            subtitle={
              status === "all"
                ? "No one has applied to this job yet."
                : `No ${status} applicants.`
            }
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((app) => {
              const fl = app.freelancer || {};
              const badge = STATUS_BADGE[app.status] || STATUS_BADGE.pending;
              const isOpen = expanded === app._id;

              return (
                <div
                  key={app._id}
                  className="card"
                  style={{
                    borderColor:
                      app.status === "accepted"
                        ? "rgba(16,185,129,0.3)"
                        : app.status === "shortlisted"
                          ? "rgba(20,184,166,0.3)"
                          : undefined,
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 14, flex: 1, minWidth: 0 }}
                    >
                      <AvatarPlaceholder
                        name={fl.name || "?"}
                        size={48}
                        style={{ flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <Link
                            to={`/profile/${fl._id}`}
                            style={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: "var(--text-primary)",
                              textDecoration: "none",
                            }}
                          >
                            {fl.name || "Freelancer"}
                          </Link>
                          <span className={`badge ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            marginTop: 3,
                          }}
                        >
                          {fl.location || "Remote"} · Applied{" "}
                          {formatDistanceToNow(new Date(app.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        {fl.skills?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginTop: 8,
                            }}
                          >
                            {fl.skills.slice(0, 5).map((s) => (
                              <span
                                key={s}
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-full)",
                                  background: "var(--bg-hover)",
                                  color: "var(--text-muted)",
                                  fontSize: 12,
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 22,
                            color: "var(--amber)",
                          }}
                        >
                          ${app.proposedRate}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          bid
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {app.estimatedDays}d
                        </div>
                        <div
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          delivery
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover letter preview / expanded */}
                  <div
                    style={{
                      marginTop: 16,
                      background: "var(--bg-raised)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      borderLeft: "3px solid var(--border)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        lineHeight: 1.7,
                        ...(isOpen
                          ? {}
                          : {
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }),
                      }}
                    >
                      {app.coverLetter}
                    </p>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--amber)",
                        fontSize: 13,
                        cursor: "pointer",
                        marginTop: 6,
                        fontFamily: "var(--font-body)",
                        padding: 0,
                      }}
                      onClick={() => setExpanded(isOpen ? null : app._id)}
                    >
                      {isOpen ? "Show less ↑" : "Read full letter ↓"}
                    </button>
                  </div>

                  {/* Client note */}
                  {app.clientNote && (
                    <div
                      style={{
                        marginTop: 12,
                        background: "var(--info-dim)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 14px",
                        fontSize: 13,
                      }}
                    >
                      <strong style={{ color: "var(--info)" }}>
                        Your note:
                      </strong>{" "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {app.clientNote}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!["accepted", "rejected", "withdrawn"].includes(
                    app.status,
                  ) && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      {app.status !== "shortlisted" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updating === app._id}
                          onClick={() =>
                            openUpdateModal(app._id, "shortlisted")
                          }
                        >
                          <FiStar size={13} /> Shortlist
                        </button>
                      )}
                      <button
                        className="btn btn-sm"
                        style={{
                          background: "var(--success-dim)",
                          color: "var(--success)",
                          border: "1px solid rgba(16,185,129,0.25)",
                        }}
                        disabled={updating === app._id}
                        onClick={() => openUpdateModal(app._id, "accepted")}
                      >
                        {updating === app._id ? (
                          <div className="spinner" />
                        ) : (
                          <FiCheck size={13} />
                        )}{" "}
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={updating === app._id}
                        onClick={() => openUpdateModal(app._id, "rejected")}
                      >
                        <FiX size={13} /> Reject
                      </button>
                      <Link
                        to={`/profile/${fl._id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        <FiExternalLink size={13} /> Profile
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note modal */}
      {noteModal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 440,
              width: "100%",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              {noteModal.newStatus === "accepted"
                ? "✅ Accept applicant"
                : noteModal.newStatus === "rejected"
                  ? "❌ Reject applicant"
                  : "⭐ Shortlist applicant"}
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              Optionally leave a note for this applicant (visible to them).
            </p>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Optional note…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setNoteModal({ open: false, appId: null, newStatus: null })
                }
              >
                Cancel
              </button>
              <button
                className={`btn ${noteModal.newStatus === "accepted" ? "btn-primary" : noteModal.newStatus === "rejected" ? "btn-danger" : "btn-secondary"}`}
                onClick={handleStatusUpdate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
