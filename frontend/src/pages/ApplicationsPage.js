/**
 * pages/ApplicationsPage.js
 * Freelancer-only: view all submitted applications with status and withdraw option.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardLayout, PageHeader, LoadingSpinner, Pagination, EmptyState, ConfirmModal } from '../components/SharedComponents';
import { applicationAPI, getErrorMessage } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { FiExternalLink, FiX, FiDollarSign, FiClock } from 'react-icons/fi';

const STATUS_BADGE = {
  pending:     'badge-muted',
  shortlisted: 'badge-amber',
  accepted:    'badge-green',
  rejected:    'badge-red',
  withdrawn:   'badge-muted',
};

const STATUS_TABS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'];

export default function ApplicationsPage() {
  const [apps,       setApps]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [withdrawModal, setWithdrawModal] = useState({ open: false, appId: null });

  const fetchApps = useCallback(async (st, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (st !== 'all') params.status = st;
      const res = await applicationAPI.getMyApplications(params);
      setApps(res.data.applications);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(status, page); }, [fetchApps, status, page]);

  const handleWithdraw = async () => {
    try {
      await applicationAPI.withdraw(withdrawModal.appId);
      toast.success('Application withdrawn');
      setApps(a => a.map(x => x._id === withdrawModal.appId ? { ...x, status: 'withdrawn' } : x));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWithdrawModal({ open: false, appId: null });
    }
  };

  const handleTabChange = tab => { setStatus(tab); setPage(1); };

  return (
    <DashboardLayout>
      <div className="page-enter">
        <PageHeader
          title="My Applications"
          subtitle={pagination ? `${pagination.total} application${pagination.total !== 1 ? 's' : ''} submitted` : 'Track your proposals'}
          action={<Link to="/jobs" className="btn btn-primary">Browse More Jobs</Link>}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => handleTabChange(tab)}
              style={{
                padding: '7px 16px', borderRadius: 'var(--radius-full)',
                border: `1px solid ${status === tab ? 'var(--amber)' : 'var(--border)'}`,
                background: status === tab ? 'var(--amber-dim)' : 'var(--bg-raised)',
                color: status === tab ? 'var(--amber)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-body)', textTransform: 'capitalize',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading applications…" />
        ) : apps.length === 0 ? (
          <EmptyState icon="📨" title="No applications here"
            subtitle={status === 'all' ? 'Browse jobs and submit your first proposal.' : `No ${status} applications.`}
            action={<Link to="/jobs" className="btn btn-primary">Find Jobs</Link>} />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {apps.map(app => <ApplicationCard key={app._id} app={app}
                onWithdraw={() => setWithdrawModal({ open: true, appId: app._id })} />)}
            </div>
            <Pagination pagination={pagination} onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>

      <ConfirmModal
        open={withdrawModal.open}
        title="Withdraw application?"
        message="You can re-apply later if the job is still open. This action cannot be undone."
        confirmLabel="Withdraw"
        dangerous
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawModal({ open: false, appId: null })}
      />
    </DashboardLayout>
  );
}

function ApplicationCard({ app, onWithdraw }) {
  const canWithdraw = ['pending', 'shortlisted'].includes(app.status);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/jobs/${app.job?._id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {app.job?.title || 'Untitled Job'}
            </h3>
          </Link>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge badge-muted">{app.job?.category}</span>
            <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{app.job?.location}</span>
            {app.job?.client && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                by {app.job.client.name}
              </span>
            )}
          </div>
        </div>
        <span className={`badge ${STATUS_BADGE[app.status] || 'badge-muted'}`} style={{ flexShrink: 0, textTransform: 'capitalize' }}>
          {app.status}
        </span>
      </div>

      {/* Cover letter preview */}
      <div style={{
        background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)',
        padding: '12px 16px', borderLeft: '3px solid var(--amber)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {app.coverLetter}
        </p>
      </div>

      {/* Meta + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
            <FiDollarSign size={13} /> <strong style={{ color: 'var(--amber)' }}>${app.proposedRate}</strong> bid
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
            <FiClock size={13} /> {app.estimatedDays} day{app.estimatedDays !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/jobs/${app.job?._id}`} className="btn btn-ghost btn-sm">
            <FiExternalLink size={13} /> View Job
          </Link>
          {canWithdraw && (
            <button className="btn btn-danger btn-sm" onClick={onWithdraw}>
              <FiX size={13} /> Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Client note if any */}
      {app.clientNote && (
        <div style={{ background: 'var(--info-dim)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 13 }}>
          <strong style={{ color: 'var(--info)' }}>Client note:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{app.clientNote}</span>
        </div>
      )}
    </div>
  );
}
