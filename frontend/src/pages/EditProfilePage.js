/**
 * pages/EditProfilePage.js
 * Allows the authenticated user to update bio, skills, hourlyRate, location,
 * profilePic URL, portfolio items, and change password.
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DashboardLayout, PageHeader } from "../components/SharedComponents";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import { userAPI, authAPI, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  FiPlus,
  FiX,
  FiSave,
  FiExternalLink,
  FiTrash2,
  FiLock,
} from "react-icons/fi";

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    hourlyRate: user.hourlyRate || "",
    profilePic: user.profilePic || "",
    skills: user.skills || [],
    skillInput: "",
  });

  const [portfolio, setPortfolio] = useState(user.portfolio || []);
  const [portfolioNew, setPortfolioNew] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [addingPort, setAddingPort] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [removingPortId, setRemovingPortId] = useState(null);

  const set = (f, v) => setForm((x) => ({ ...x, [f]: v }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) {
      toast.error("Already added");
      return;
    }
    if (form.skills.length >= 20) {
      toast.error("Max 20 skills");
      return;
    }
    set("skills", [...form.skills, s]);
    set("skillInput", "");
  };
  const removeSkill = (s) =>
    set(
      "skills",
      form.skills.filter((x) => x !== s),
    );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        skills: form.skills,
        ...(form.hourlyRate ? { hourlyRate: Number(form.hourlyRate) } : {}),
        ...(form.profilePic.trim()
          ? { profilePic: form.profilePic.trim() }
          : {}),
      };
      const res = await userAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!portfolioNew.title.trim() || !portfolioNew.url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    setAddingPort(true);
    try {
      const res = await userAPI.addPortfolioItem(portfolioNew);
      setPortfolio(res.data.portfolio);
      setPortfolioNew({ title: "", url: "", description: "" });
      toast.success("Portfolio item added");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAddingPort(false);
    }
  };

  const handleRemovePortfolio = async (itemId) => {
    setRemovingPortId(itemId);
    try {
      const res = await userAPI.removePortfolioItem(itemId);
      setPortfolio(res.data.portfolio);
      toast.success("Item removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemovingPortId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("Password must be 8+ characters");
      return;
    }
    setSavingPw(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password updated!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-enter" style={{ maxWidth: 760, margin: "0 auto" }}>
        <PageHeader
          title="Edit Profile"
          subtitle="Keep your profile up to date"
          action={
            <Link to={`/profile/${user._id}`} className="btn btn-ghost btn-sm">
              <FiExternalLink size={14} /> View Profile
            </Link>
          }
        />

        {/* Avatar preview */}
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <AvatarPlaceholder name={form.name} size={72} />
          <div style={{ flex: 1 }}>
            <div className="form-group">
              <label className="form-label">
                Profile Picture URL (optional)
              </label>
              <input
                className="form-input"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={form.profilePic}
                onChange={(e) => set("profilePic", e.target.value)}
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          <Section title="01. Basic Info">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  placeholder="e.g. New York, USA"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  maxLength={100}
                />
              </div>
              {user.role === "freelancer" && (
                <div className="form-group">
                  <label className="form-label">Hourly Rate ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="10000"
                    placeholder="75"
                    value={form.hourlyRate}
                    onChange={(e) => set("hourlyRate", e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Tell clients about yourself, your experience, and what you do best…"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                maxLength={1000}
              />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {form.bio.length}/1000
              </span>
            </div>
          </Section>

          {user.role === "freelancer" && (
            <Section title="02. Skills">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="form-input"
                  placeholder="Add a skill, press Enter"
                  value={form.skillInput}
                  onChange={(e) => set("skillInput", e.target.value)}
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {form.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 14px",
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
                {form.skills.length === 0 && (
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    No skills added yet
                  </span>
                )}
              </div>
            </Section>
          )}

          <div style={{ display: "flex", gap: 12 }}>
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
                <>
                  <FiSave size={16} /> Save Profile
                </>
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

        {/* Portfolio — freelancer only */}
        {user.role === "freelancer" && (
          <div style={{ marginTop: 32 }}>
            <Section title="03. Portfolio">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {portfolio.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      background: "var(--bg-raised)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "var(--amber)" }}
                      >
                        {item.url}
                      </a>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemovePortfolio(item._id)}
                      disabled={removingPortId === item._id}
                    >
                      {removingPortId === item._id ? (
                        <div className="spinner" />
                      ) : (
                        <FiTrash2 size={13} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  border: "1px dashed var(--border-strong)",
                  borderRadius: "var(--radius-md)",
                  padding: 20,
                }}
              >
                <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
                  Add Portfolio Item
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input
                    className="form-input"
                    placeholder="Project title *"
                    value={portfolioNew.title}
                    onChange={(e) =>
                      setPortfolioNew((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                  <input
                    className="form-input"
                    type="url"
                    placeholder="Project URL * (https://…)"
                    value={portfolioNew.url}
                    onChange={(e) =>
                      setPortfolioNew((p) => ({ ...p, url: e.target.value }))
                    }
                  />
                  <input
                    className="form-input"
                    placeholder="Short description (optional)"
                    value={portfolioNew.description}
                    onChange={(e) =>
                      setPortfolioNew((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={handleAddPortfolio}
                    disabled={addingPort}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {addingPort ? (
                      <>
                        <div className="spinner" /> Adding…
                      </>
                    ) : (
                      <>
                        <FiPlus size={15} /> Add Item
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Change password */}
        <div style={{ marginTop: 32 }}>
          <form onSubmit={handleChangePassword}>
            <Section title="🔒 Change Password">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={savingPw}
                style={{ alignSelf: "flex-start" }}
              >
                {savingPw ? (
                  <>
                    <div className="spinner" /> Updating…
                  </>
                ) : (
                  <>
                    <FiLock size={15} /> Update Password
                  </>
                )}
              </button>
            </Section>
          </form>
        </div>

        <div style={{ paddingBottom: 60 }} />
      </div>
    </DashboardLayout>
  );
}

const Section = ({ title, children }) => (
  <div
    className="card"
    style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
