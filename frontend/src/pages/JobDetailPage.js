/**
 * pages/JobDetailPage.js
 * Full job detail view. Freelancers can apply inline; clients see manage options.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import { LoadingSpinner } from '../components/SharedComponents';
import { jobAPI, applicationAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FiMapPin, FiClock, FiDollarSign, FiUsers, FiTag,
  FiEdit, FiTrash2, FiArrowLeft, FiCheck, FiX,
} from 'react-icons/fi';

const STATUS_BADGE = {
  open: 'badge-green', in_progress: 'badge-amber',
  completed: 'badge-blue', cancelled: 'badge-muted',
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job,         setJob]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showApply,   setShowApply]   = useState(false);
  const [applying,    setApplying]    = useState(false);
  const [hasApplied,  setHasApplied]  = useState(false);
  const [applyForm,   setApplyForm]   = useState({ coverLetter: '', proposedRate: '', estimatedDays: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await jobAPI.getById(id);
        setJob(res.data.job);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleApply = async e => {
    e.preventDefault();
    if (!applyForm.coverLetter || !applyForm.proposedRate || !applyForm.estimatedDays) {
      toast.error('Please fill in all fields'); return;
    }
    if (applyForm.coverLetter.length < 50) {
      toast.error('Cover letter must be at least 50 characters'); return;
    }
    setApplying(true);
    try {
      await applicationAPI.apply({
        jobId: id,
        coverLetter: applyForm.coverLetter,
        proposedRate: Number(applyForm.proposedRate),
        estimatedDays: Number(applyForm.estimatedDays),
      });
      toast.success('Application submitted! 🎉');
      setHasApplied(true);
      setShowApply(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await jobAPI.remove(id);
      toast.success('Job deleted');
      navigate('/my-jobs');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper"><Navbar /><LoadingSpinner message="Loading job…" /></div>
  );
  if (!job) return null;

  const isOwner     = user && job.client?._id === user._id;
  const isFreelancer = user?.role === 'freelancer';
  const clientName  = job.client?.name || 'Anonymous';

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          <FiArrowLeft size={15} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'flex-start' }}>
          {/* ── Left column ── */}
          <div>
            {/* Title + status */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className={`badge ${STATUS_BADGE[job.status] || 'badge-muted'}`}>
                  {job.status?.replace('_', ' ')}
                </span>
                <span className="badge badge-muted">{job.category}</span>
                <span className="badge badge-muted">{job.experienceLevel} level</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 38px)', lineHeight: 1.2, marginBottom: 16 }}>
                {job.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <MetaItem icon={<FiDollarSign size={14} />}
                  text={`$${job.budgetMin} – $${job.budgetMax} ${job.budgetType === 'hourly' ? '/ hr' : 'fixed'}`} />
                <MetaItem icon={<FiMapPin size={14} />} text={job.location} />
                <MetaItem icon={<FiClock size={14} />}
                  text={`Posted ${formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}`} />
                <MetaItem icon={<FiUsers size={14} />}
                  text={`${job.applicationCount ?? 0} applicant${job.applicationCount !== 1 ? 's' : ''}`} />
                {job.deadline && (
                  <MetaItem icon={<FiClock size={14} />} text={`Deadline: ${format(new Date(job.deadline), 'MMM d, yyyy')}`} />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Job Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Required Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {job.skills.map(s => (
                    <span key={s} style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      background: 'var(--amber-dim)', color: 'var(--amber)',
                      fontSize: 13, fontWeight: 500, border: '1px solid rgba(245,158,11,0.2)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply form (inline slide-down) */}
            {showApply && (
              <div className="card page-enter" style={{ marginBottom: 24, borderColor: 'var(--amber)', boxShadow: 'var(--shadow-amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Submit Proposal</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowApply(false)}><FiX size={16} /></button>
                </div>
                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label">Cover Letter <span style={{ color: 'var(--text-muted)' }}>(min. 50 characters)</span></label>
                    <textarea
                      className="form-textarea"
                      rows={6}
                      placeholder="Introduce yourself, explain why you're the right fit, and describe your approach…"
                      value={applyForm.coverLetter}
                      onChange={e => setApplyForm(f => ({ ...f, coverLetter: e.target.value }))}
                    />
                    <span style={{ fontSize: 12, color: applyForm.coverLetter.length < 50 ? 'var(--text-muted)' : 'var(--success)' }}>
                      {applyForm.coverLetter.length} / 3000
                    </span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Rate / Bid ($)</label>
                      <input className="form-input" type="number" min="1"
                        placeholder={`e.g. ${job.budgetMin}`}
                        value={applyForm.proposedRate}
                        onChange={e => setApplyForm(f => ({ ...f, proposedRate: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Estimated Days</label>
                      <input className="form-input" type="number" min="1" max="365"
                        placeholder="e.g. 14"
                        value={applyForm.estimatedDays}
                        onChange={e => setApplyForm(f => ({ ...f, estimatedDays: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={applying}>
                      {applying ? <><div className="spinner" /> Submitting…</> : <><FiCheck size={15} /> Submit Proposal</>}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* CTA card */}
            <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Budget</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--amber)', marginBottom: 4 }}>
                ${job.budgetMin}–${job.budgetMax}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                {job.budgetType === 'hourly' ? 'per hour' : 'fixed price'}
              </div>

              {!user && (
                <Link to="/login" className="btn btn-primary btn-full">Sign in to Apply</Link>
              )}
              {isFreelancer && job.status === 'open' && !hasApplied && !showApply && (
                <button className="btn btn-primary btn-full" onClick={() => setShowApply(true)}>
                  Apply Now
                </button>
              )}
              {isFreelancer && (hasApplied || showApply) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 600, justifyContent: 'center', padding: '8px 0' }}>
                  <FiCheck size={16} /> {hasApplied ? 'Application Submitted' : 'Applying…'}
                </div>
              )}
              {isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link to={`/jobs/${id}/applicants`} className="btn btn-primary btn-full">
                    <FiUsers size={15} /> View Applicants ({job.applicationCount ?? 0})
                  </Link>
                  <Link to={`/jobs/${id}/edit`} className="btn btn-secondary btn-full">
                    <FiEdit size={15} /> Edit Job
                  </Link>
                  <button className="btn btn-danger btn-full" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? <><div className="spinner" /> Deleting…</> : <><FiTrash2 size={15} /> Delete Job</>}
                  </button>
                </div>
              )}
            </div>

            {/* Client card */}
            {job.client && (
              <div className="card">
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Posted by</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <AvatarPlaceholder name={clientName} size={44} />
                  <div>
                    <Link to={`/profile/${job.client._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {clientName}
                    </Link>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.client.location || 'Remote'}</div>
                  </div>
                </div>
                {job.client.bio && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.client.bio}
                  </p>
                )}
                <Link to={`/profile/${job.client._id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                  <FiTag size={13} /> View Profile
                </Link>
              </div>
            )}

            {/* Job details */}
            <div className="card">
              <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Job Details</h4>
              <DetailRow label="Category" value={job.category} />
              <DetailRow label="Experience" value={job.experienceLevel} capitalize />
              <DetailRow label="Location" value={job.location} capitalize />
              <DetailRow label="Budget Type" value={job.budgetType} capitalize />
              {job.deadline && <DetailRow label="Deadline" value={format(new Date(job.deadline), 'MMM d, yyyy')} />}
              <DetailRow label="Posted" value={formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          main > div > div:first-child { grid-column: 1 / -1 !important; }
          main > div { display: flex !important; flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}

const MetaItem = ({ icon, text }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-muted)' }}>
    {icon}{text}
  </span>
);
const DetailRow = ({ label, value, capitalize }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, textTransform: capitalize ? 'capitalize' : undefined }}>{value}</span>
  </div>
);
