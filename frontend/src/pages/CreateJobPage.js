/**
 * pages/CreateJobPage.js
 * Multi-section form for clients to post a new job.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardLayout, PageHeader } from '../components/SharedComponents';
import { jobAPI, getErrorMessage } from '../services/api';
import { FiPlus, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development','Mobile Development','Design & Creative',
  'Writing & Translation','Digital Marketing','Video & Animation',
  'Music & Audio','Data Science & Analytics','Cybersecurity',
  'Cloud & DevOps','Blockchain','AI & Machine Learning',
  'Customer Support','Business & Finance','Other',
];

const INITIAL = {
  title: '', description: '', category: '',
  budgetType: 'fixed', budgetMin: '', budgetMax: '',
  location: 'remote', experienceLevel: 'intermediate',
  deadline: '', skillInput: '', skills: [],
};

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) { toast.error('Skill already added'); return; }
    if (form.skills.length >= 15) { toast.error('Max 15 skills'); return; }
    set('skills', [...form.skills, s]);
    set('skillInput', '');
  };

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 5)
      e.title = 'Title must be at least 5 characters';
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters';
    if (!form.category)
      e.category = 'Please select a category';
    if (!form.budgetMin || isNaN(form.budgetMin) || Number(form.budgetMin) < 1)
      e.budgetMin = 'Enter a valid minimum budget';
    if (!form.budgetMax || isNaN(form.budgetMax) || Number(form.budgetMax) < Number(form.budgetMin))
      e.budgetMax = 'Max budget must be ≥ min budget';
    if (form.deadline && new Date(form.deadline) <= new Date())
      e.deadline = 'Deadline must be a future date';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Please fix the highlighted fields'); return; }

    setLoading(true);
    try {
      const payload = {
        title:           form.title.trim(),
        description:     form.description.trim(),
        category:        form.category,
        skills:          form.skills,
        budgetType:      form.budgetType,
        budgetMin:       Number(form.budgetMin),
        budgetMax:       Number(form.budgetMax),
        location:        form.location,
        experienceLevel: form.experienceLevel,
        ...(form.deadline ? { deadline: new Date(form.deadline).toISOString() } : {}),
      };
      const res = await jobAPI.create(payload);
      toast.success('Job posted successfully! 🎉');
      navigate(`/jobs/${res.data.job._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-enter" style={{ maxWidth: 760, margin: '0 auto' }}>
        <PageHeader title="Post a New Job" subtitle="Tell freelancers what you need" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section: Basic Info */}
          <FormSection title="01. Basic Information">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Build a React Analytics Dashboard"
                value={form.title} onChange={e => set('title', e.target.value)} maxLength={120} />
              {errors.title && <span className="form-error">{errors.title}</span>}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.title.length}/120</span>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                rows={8}
                placeholder="Describe the project in detail: what you need built, technologies involved, design resources available, and any specific requirements…"
                value={form.description} onChange={e => set('description', e.target.value)} maxLength={5000} />
              {errors.description && <span className="form-error">{errors.description}</span>}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.description.length}/5000</span>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className={`form-select ${errors.category ? 'input-error' : ''}`}
                value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>
          </FormSection>

          {/* Section: Budget */}
          <FormSection title="02. Budget">
            <div className="form-group">
              <label className="form-label">Budget Type *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['fixed', 'hourly'].map(t => (
                  <button key={t} type="button"
                    style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.budgetType === t ? 'var(--amber)' : 'var(--border)'}`,
                      background: form.budgetType === t ? 'var(--amber-dim)' : 'var(--bg-raised)',
                      color: form.budgetType === t ? 'var(--amber)' : 'var(--text-secondary)',
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      textTransform: 'capitalize', fontSize: 14,
                    }}
                    onClick={() => set('budgetType', t)}>
                    {t === 'fixed' ? '💰 Fixed Price' : '⏱ Hourly Rate'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Budget ($) *</label>
                <input className={`form-input ${errors.budgetMin ? 'input-error' : ''}`}
                  type="number" min="1" placeholder="500"
                  value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} />
                {errors.budgetMin && <span className="form-error">{errors.budgetMin}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Max Budget ($) *</label>
                <input className={`form-input ${errors.budgetMax ? 'input-error' : ''}`}
                  type="number" min="1" placeholder="2000"
                  value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} />
                {errors.budgetMax && <span className="form-error">{errors.budgetMax}</span>}
              </div>
            </div>
          </FormSection>

          {/* Section: Requirements */}
          <FormSection title="03. Requirements">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-select" value={form.experienceLevel}
                  onChange={e => set('experienceLevel', e.target.value)}>
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Work Location</label>
                <select className="form-select" value={form.location}
                  onChange={e => set('location', e.target.value)}>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline (optional)</label>
              <input className={`form-input ${errors.deadline ? 'input-error' : ''}`}
                type="date" value={form.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('deadline', e.target.value)} />
              {errors.deadline && <span className="form-error">{errors.deadline}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Add a skill and press Enter or +"
                  value={form.skillInput}
                  onChange={e => set('skillInput', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                <button type="button" className="btn btn-secondary" onClick={addSkill}>
                  <FiPlus size={16} />
                </button>
              </div>
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {form.skills.map(s => (
                    <span key={s} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      background: 'var(--amber-dim)', color: 'var(--amber)',
                      fontSize: 13, border: '1px solid rgba(245,158,11,0.3)',
                    }}>
                      {s}
                      <FiX size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12, paddingBottom: 40 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><div className="spinner" /> Publishing…</> : '🚀 Post Job'}
            </button>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>

      <style>{`.input-error { border-color: var(--error) !important; }`}</style>
    </DashboardLayout>
  );
}

const FormSection = ({ title, children }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--amber)', marginBottom: 4 }}>{title}</h3>
    {children}
  </div>
);
