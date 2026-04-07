/**
 * pages/EditJobPage.js
 * Pre-populates all fields from the existing job and submits a PATCH.
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  DashboardLayout,
  PageHeader,
  LoadingSpinner,
} from "../components/SharedComponents";
import { jobAPI, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiX } from "react-icons/fi";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design & Creative",
  "Writing & Translation",
  "Digital Marketing",
  "Video & Animation",
  "Music & Audio",
  "Data Science & Analytics",
  "Cybersecurity",
  "Cloud & DevOps",
  "Blockchain",
  "AI & Machine Learning",
  "Customer Support",
  "Business & Finance",
  "Other",
];

export default function EditJobPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await jobAPI.getById(id);
        const j = res.data.job;
        // Guard: only owner can edit
        if (j.client?._id !== user._id) {
          toast.error("You do not own this job");
          navigate("/my-jobs");
          return;
        }
        setForm({
          title: j.title,
          description: j.description,
          category: j.category,
          budgetType: j.budgetType,
          budgetMin: String(j.budgetMin),
          budgetMax: String(j.budgetMax),
          location: j.location,
          experienceLevel: j.experienceLevel,
          deadline: j.deadline ? j.deadline.split("T")[0] : "",
          skills: j.skills || [],
          status: j.status,
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate("/my-jobs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user._id, navigate]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) {
      toast.error("Skill already added");
      return;
    }
    if (form.skills.length >= 15) {
      toast.error("Max 15 skills");
      return;
    }
    set("skills", [...form.skills, s]);
    setSkillInput("");
  };
  const removeSkill = (s) =>
    set(
      "skills",
      form.skills.filter((x) => x !== s),
    );

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)
      e.title = "Title must be at least 5 characters";
    if (!form.description.trim() || form.description.length < 20)
      e.description = "Description must be at least 20 characters";
    if (!form.category) e.category = "Please select a category";
    if (!form.budgetMin || Number(form.budgetMin) < 1)
      e.budgetMin = "Enter a valid minimum budget";
    if (!form.budgetMax || Number(form.budgetMax) < Number(form.budgetMin))
      e.budgetMax = "Max must be ≥ min budget";
    if (form.deadline && new Date(form.deadline) <= new Date())
      e.deadline = "Deadline must be a future date";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        skills: form.skills,
        budgetType: form.budgetType,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        location: form.location,
        experienceLevel: form.experienceLevel,
        status: form.status,
        ...(form.deadline
          ? { deadline: new Date(form.deadline).toISOString() }
          : {}),
      };
      await jobAPI.update(id, payload);
      toast.success("Job updated successfully!");
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading job…" />
      </DashboardLayout>
    );
  if (!form) return null;

  return (
    <DashboardLayout>
      <div className="page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
        <PageHeader
          title="Edit Job"
          subtitle="Update your job posting details"
        />

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          <Section title="01. Basic Information">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                className={`form-input ${errors.title ? "err" : ""}`}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={120}
              />
              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className={`form-textarea ${errors.description ? "err" : ""}`}
                rows={8}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={5000}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {form.description.length}/5000
              </span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className={`form-select ${errors.category ? "err" : ""}`}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="form-error">{errors.category}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="02. Budget">
            <div style={{ display: "flex", gap: 10 }}>
              {["fixed", "hourly"].map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${form.budgetType === t ? "var(--amber)" : "var(--border)"}`,
                    background:
                      form.budgetType === t
                        ? "var(--amber-dim)"
                        : "var(--bg-raised)",
                    color:
                      form.budgetType === t
                        ? "var(--amber)"
                        : "var(--text-secondary)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    textTransform: "capitalize",
                    fontSize: 14,
                  }}
                  onClick={() => set("budgetType", t)}
                >
                  {t === "fixed" ? "💰 Fixed" : "⏱ Hourly"}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min ($) *</label>
                <input
                  className={`form-input ${errors.budgetMin ? "err" : ""}`}
                  type="number"
                  min="1"
                  value={form.budgetMin}
                  onChange={(e) => set("budgetMin", e.target.value)}
                />
                {errors.budgetMin && (
                  <span className="form-error">{errors.budgetMin}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Max ($) *</label>
                <input
                  className={`form-input ${errors.budgetMax ? "err" : ""}`}
                  type="number"
                  min="1"
                  value={form.budgetMax}
                  onChange={(e) => set("budgetMax", e.target.value)}
                />
                {errors.budgetMax && (
                  <span className="form-error">{errors.budgetMax}</span>
                )}
              </div>
            </div>
          </Section>

          <Section title="03. Requirements">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  className="form-select"
                  value={form.experienceLevel}
                  onChange={(e) => set("experienceLevel", e.target.value)}
                >
                  <option value="entry">Entry</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select
                  className="form-select"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                className={`form-input ${errors.deadline ? "err" : ""}`}
                type="date"
                value={form.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("deadline", e.target.value)}
              />
              {errors.deadline && (
                <span className="form-error">{errors.deadline}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add skill + Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addSkill}
                >
                  <FiPlus size={16} />
                </button>
              </div>
              {form.skills.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--amber-dim)",
                        color: "var(--amber)",
                        fontSize: 13,
                        border: "1px solid rgba(20,184,166,0.3)",
                      }}
                    >
                      {s}{" "}
                      <FiX
                        size={12}
                        style={{ cursor: "pointer" }}
                        onClick={() => removeSkill(s)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner" /> Saving…
                </>
              ) : (
                "💾 Save Changes"
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`.err { border-color: var(--error) !important; }`}</style>
    </DashboardLayout>
  );
}

const Section = ({ title, children }) => (
  <div
    className="card"
    style={{ display: "flex", flexDirection: "column", gap: 20 }}
  >
    <h3
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 20,
        color: "var(--amber)",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);
