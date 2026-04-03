/**
 * pages/JobsPage.js
 * Public job board with full search + multi-filter panel.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { LoadingSpinner, Pagination, EmptyState, PageHeader } from '../components/SharedComponents';
import { jobAPI, getErrorMessage } from '../services/api';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development','Mobile Development','Design & Creative',
  'Writing & Translation','Digital Marketing','Video & Animation',
  'Music & Audio','Data Science & Analytics','Cybersecurity',
  'Cloud & DevOps','Blockchain','AI & Machine Learning',
  'Customer Support','Business & Finance','Other',
];
const EXPERIENCE = ['entry','intermediate','expert'];
const LOCATIONS  = ['remote','onsite','hybrid'];
const SORT_OPTS  = [
  { value: 'newest',      label: 'Newest first' },
  { value: 'oldest',      label: 'Oldest first' },
  { value: 'budget_asc',  label: 'Budget: Low → High' },
  { value: 'budget_desc', label: 'Budget: High → Low' },
];

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs,       setJobs]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    search:          searchParams.get('search')   || '',
    category:        searchParams.get('category') || '',
    location:        '',
    experienceLevel: '',
    budgetType:      '',
    minBudget:       '',
    maxBudget:       '',
    sort:            'newest',
    page:            1,
  });

  const fetchJobs = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = { page: f.page, limit: 10, status: 'open' };
      if (f.search)          params.search          = f.search;
      if (f.category)        params.category        = f.category;
      if (f.location)        params.location        = f.location;
      if (f.experienceLevel) params.experienceLevel = f.experienceLevel;
      if (f.budgetType)      params.budgetType      = f.budgetType;
      if (f.minBudget)       params.minBudget       = f.minBudget;
      if (f.maxBudget)       params.maxBudget       = f.maxBudget;
      if (f.sort)            params.sort            = f.sort;

      const res = await jobAPI.getAll(params);
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(filters); }, []); // eslint-disable-line

  const applyFilters = () => {
    const newF = { ...filters, page: 1 };
    setFilters(newF);
    fetchJobs(newF);
    setShowFilter(false);
  };

  const handleSearch = e => {
    e.preventDefault();
    applyFilters();
  };

  const resetFilters = () => {
    const reset = { search:'', category:'', location:'', experienceLevel:'', budgetType:'', minBudget:'', maxBudget:'', sort:'newest', page:1 };
    setFilters(reset);
    fetchJobs(reset);
  };

  const setPage = (p) => {
    const newF = { ...filters, page: p };
    setFilters(newF);
    fetchJobs(newF);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = [filters.category, filters.location, filters.experienceLevel, filters.budgetType, filters.minBudget, filters.maxBudget]
    .filter(Boolean).length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        <PageHeader
          title="Browse Jobs"
          subtitle={pagination ? `${pagination.total.toLocaleString()} opportunities available` : 'Find your next project'}
        />

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input
              className="form-input"
              style={{ paddingLeft: 44 }}
              placeholder="Search jobs by title, skill, or keyword…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowFilter(v => !v)} style={{ position: 'relative' }}>
            <FiFilter size={15} /> Filters
            {activeFiltersCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--amber)', color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        {/* Sort + active tags row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filters.category && <FilterTag label={filters.category} onRemove={() => { setFilters(f => ({ ...f, category: '', page: 1 })); }} />}
            {filters.location && <FilterTag label={filters.location} onRemove={() => { setFilters(f => ({ ...f, location: '', page: 1 })); }} />}
            {filters.experienceLevel && <FilterTag label={filters.experienceLevel} onRemove={() => { setFilters(f => ({ ...f, experienceLevel: '', page: 1 })); }} />}
            {activeFiltersCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={resetFilters} style={{ fontSize: 12 }}>
                <FiX size={13} /> Clear all
              </button>
            )}
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 180 }}
            value={filters.sort}
            onChange={e => { const f = { ...filters, sort: e.target.value, page: 1 }; setFilters(f); fetchJobs(f); }}
          >
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Filter panel */}
          {showFilter && (
            <div className="card" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4 style={{ fontWeight: 600 }}>Filters</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowFilter(false)}><FiX size={15} /></button>
              </div>

              <FilterSection label="Category">
                <select className="form-select" value={filters.category}
                  onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FilterSection>

              <FilterSection label="Location">
                {LOCATIONS.map(l => (
                  <RadioChip key={l} label={l} selected={filters.location === l}
                    onClick={() => setFilters(f => ({ ...f, location: f.location === l ? '' : l }))} />
                ))}
              </FilterSection>

              <FilterSection label="Experience Level">
                {EXPERIENCE.map(e => (
                  <RadioChip key={e} label={e} selected={filters.experienceLevel === e}
                    onClick={() => setFilters(f => ({ ...f, experienceLevel: f.experienceLevel === e ? '' : e }))} />
                ))}
              </FilterSection>

              <FilterSection label="Budget Type">
                {['fixed','hourly'].map(t => (
                  <RadioChip key={t} label={t} selected={filters.budgetType === t}
                    onClick={() => setFilters(f => ({ ...f, budgetType: f.budgetType === t ? '' : t }))} />
                ))}
              </FilterSection>

              <FilterSection label="Budget Range ($)">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" type="number" placeholder="Min" value={filters.minBudget}
                    onChange={e => setFilters(f => ({ ...f, minBudget: e.target.value }))} style={{ flex: 1 }} />
                  <input className="form-input" type="number" placeholder="Max" value={filters.maxBudget}
                    onChange={e => setFilters(f => ({ ...f, maxBudget: e.target.value }))} style={{ flex: 1 }} />
                </div>
              </FilterSection>

              <button className="btn btn-primary btn-full" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={resetFilters}>Reset</button>
            </div>
          )}

          {/* Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <LoadingSpinner message="Searching jobs…" />
            ) : jobs.length === 0 ? (
              <EmptyState icon="🔍" title="No jobs found"
                subtitle="Try adjusting your search or filters."
                action={<button className="btn btn-secondary" onClick={resetFilters}>Clear Filters</button>} />
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {jobs.map(job => <JobCard key={job._id} job={job} />)}
                </div>
                <Pagination pagination={pagination} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const FilterTag = ({ label, onRemove }) => (
  <span className="badge badge-amber" style={{ gap: 6, cursor: 'pointer' }} onClick={onRemove}>
    {label} <FiX size={11} />
  </span>
);
const FilterSection = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div className="form-label" style={{ marginBottom: 10 }}>{label}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
  </div>
);
const RadioChip = ({ label, selected, onClick }) => (
  <button onClick={onClick} style={{
    padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500,
    border: `1px solid ${selected ? 'var(--amber)' : 'var(--border)'}`,
    background: selected ? 'var(--amber-dim)' : 'var(--bg-raised)',
    color: selected ? 'var(--amber)' : 'var(--text-secondary)',
    cursor: 'pointer', fontFamily: 'var(--font-body)',
    textTransform: 'capitalize',
  }}>{label}</button>
);
