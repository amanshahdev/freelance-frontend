/**
 * pages/MyJobsPage.js
 * Client-only page: full list of their own jobs with edit/delete/view-applicants actions.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DashboardLayout, PageHeader, LoadingSpinner, Pagination, EmptyState, ConfirmModal } from '../components/SharedComponents';
import JobCard from '../components/JobCard';
import { jobAPI, getErrorMessage } from '../services/api';
import { FiPlus } from 'react-icons/fi';

const STATUS_TABS = ['all', 'open', 'in_progress', 'completed', 'cancelled'];

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs,       setJobs]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [status,     setStatus]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [deleteModal,setDeleteModal]= useState({ open: false, jobId: null });

  const fetchJobs = useCallback(async (st, pg) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 8 };
      if (st !== 'all') params.status = st;
      const res = await jobAPI.getMyJobs(params);
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(status, page); }, [fetchJobs, status, page]);

  const handleTabChange = (tab) => { setStatus(tab); setPage(1); };
  const handlePageChange = (p)  => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleDelete = async () => {
    try {
      await jobAPI.remove(deleteModal.jobId);
      toast.success('Job deleted');
      setJobs(j => j.filter(x => x._id !== deleteModal.jobId));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteModal({ open: false, jobId: null });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-enter">
        <PageHeader
          title="My Job Listings"
          subtitle={pagination ? `${pagination.total} job${pagination.total !== 1 ? 's' : ''} posted` : 'Manage your job postings'}
          action={
            <Link to="/jobs/create" className="btn btn-primary">
              <FiPlus size={15} /> Post New Job
            </Link>
          }
        />

        {/* Status tabs */}
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
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your jobs…" />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="📋"
            title={status === 'all' ? 'No jobs posted yet' : `No ${status.replace('_', ' ')} jobs`}
            subtitle="Post your first job to start finding great freelancers."
            action={
              <Link to="/jobs/create" className="btn btn-primary">
                <FiPlus size={15} /> Post a Job
              </Link>
            }
          />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {jobs.map(job => (
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
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title="Delete this job?"
        message="This will permanently remove the job and cannot be undone."
        confirmLabel="Delete Job"
        dangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, jobId: null })}
      />
    </DashboardLayout>
  );
}
