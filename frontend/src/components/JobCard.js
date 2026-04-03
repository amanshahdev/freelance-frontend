/**
 * components/JobCard.js
 * Reusable job listing card used on browse page, dashboard, my-jobs.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiUsers, FiDollarSign, FiTag } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import AvatarPlaceholder from './AvatarPlaceholder';

const STATUS_BADGE = {
  open:        'badge-green',
  in_progress: 'badge-amber',
  completed:   'badge-blue',
  cancelled:   'badge-muted',
};

export default function JobCard({ job, showActions, onEdit, onDelete, onViewApplicants }) {
  const clientName = job.client?.name || 'Anonymous';
  const postedAgo = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

  return (
    <div className="card card-hover" style={{ transition: 'all 0.25s ease', cursor: 'default' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}
                className="truncate">
              {job.title}
            </h3>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${STATUS_BADGE[job.status] || 'badge-muted'}`}>
              {job.status?.replace('_', ' ')}
            </span>
            <span className="badge badge-muted">{job.category}</span>
            <span className="badge badge-muted">{job.experienceLevel}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <AvatarPlaceholder name={clientName} size={36} />
        </div>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 12, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {job.skills.slice(0, 5).map(skill => (
            <span key={skill} style={{
              background: 'var(--bg-hover)', color: 'var(--text-secondary)',
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              fontSize: 12, border: '1px solid var(--border)',
            }}>{skill}</span>
          ))}
          {job.skills.length > 5 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '3px 6px' }}>
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <MetaItem icon={<FiDollarSign size={13} />}
          text={`$${job.budgetMin}–$${job.budgetMax} ${job.budgetType === 'hourly' ? '/hr' : 'fixed'}`} />
        <MetaItem icon={<FiMapPin size={13} />} text={job.location} />
        <MetaItem icon={<FiClock size={13} />} text={postedAgo} />
        {job.applicationCount !== undefined && (
          <MetaItem icon={<FiUsers size={13} />} text={`${job.applicationCount} applicant${job.applicationCount !== 1 ? 's' : ''}`} />
        )}
      </div>

      {/* Client info */}
      {job.client && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <FiTag size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Posted by <Link to={`/profile/${job.client._id}`} style={{ color: 'var(--amber)', textDecoration: 'none' }}>{clientName}</Link>
          </span>
        </div>
      )}

      {/* Actions for client dashboard */}
      {showActions && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {onViewApplicants && (
            <button className="btn btn-secondary btn-sm" onClick={onViewApplicants}>
              <FiUsers size={13} /> Applicants ({job.applicationCount || 0})
            </button>
          )}
          {onEdit && (
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
          )}
          {onDelete && (
            <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
}

const MetaItem = ({ icon, text }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
    {icon}{text}
  </span>
);
