/**
 * pages/FreelancersPage.js
 * Public page to browse and search freelancers with filters.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import AvatarPlaceholder from "../components/AvatarPlaceholder";
import {
  PageHeader,
  LoadingSpinner,
  Pagination,
  EmptyState,
} from "../components/SharedComponents";
import { userAPI, getErrorMessage } from "../services/api";
import {
  FiSearch,
  FiMapPin,
  FiDollarSign,
  FiExternalLink,
} from "react-icons/fi";

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const buildQueryParams = (pageValue) => {
    const params = { page: pageValue, limit: 12 };
    if (search) params.search = search;
    if (skills) params.skills = skills;
    if (minRate) params.minRate = minRate;
    if (maxRate) params.maxRate = maxRate;
    if (location) params.location = location;
    if (sort) params.sort = sort;
    return params;
  };

  const fetchFreelancers = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await userAPI.getFreelancers({
        page: params.page,
        limit: 12,
        ...params,
      });
      setFreelancers(res.data.freelancers);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchFreelancers(buildQueryParams(page));
    }, 150);

    return () => window.clearTimeout(timer);
  }, [
    search,
    skills,
    minRate,
    maxRate,
    location,
    sort,
    page,
    fetchFreelancers,
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <PageHeader
          title="Find Talent"
          subtitle={
            pagination
              ? `${pagination.total.toLocaleString()} freelancers available`
              : "Discover skilled professionals"
          }
        />

        {/* Search + Filters */}
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
                size={18}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 44 }}
                placeholder="Search by name, skill, or keyword…"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="form-input"
              style={{ flex: "1 1 140px" }}
              placeholder="Skills (comma-separated)"
              value={skills}
              onChange={(e) => {
                setPage(1);
                setSkills(e.target.value);
              }}
            />
            <input
              className="form-input"
              style={{ flex: "1 1 100px" }}
              placeholder="Location"
              value={location}
              onChange={(e) => {
                setPage(1);
                setLocation(e.target.value);
              }}
            />
            <input
              className="form-input"
              type="number"
              style={{ flex: "1 1 80px", minWidth: 80 }}
              placeholder="Min $/hr"
              value={minRate}
              onChange={(e) => {
                setPage(1);
                setMinRate(e.target.value);
              }}
            />
            <input
              className="form-input"
              type="number"
              style={{ flex: "1 1 80px", minWidth: 80 }}
              placeholder="Max $/hr"
              value={maxRate}
              onChange={(e) => {
                setPage(1);
                setMaxRate(e.target.value);
              }}
            />
            <select
              className="form-select"
              style={{ flex: "1 1 140px" }}
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
            >
              <option value="">Sort: Default</option>
              <option value="rate_asc">Rate: Low → High</option>
              <option value="rate_desc">Rate: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
            </select>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner message="Finding freelancers…" />
        ) : freelancers.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No freelancers found"
            subtitle="Try adjusting your search or filters."
            action={
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch("");
                  setSkills("");
                  setMinRate("");
                  setMaxRate("");
                  setLocation("");
                  setSort("");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {freelancers.map((fl) => (
                <FreelancerCard key={fl._id} fl={fl} />
              ))}
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}

function FreelancerCard({ fl }) {
  return (
    <div
      className="card card-hover"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Avatar + name */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <AvatarPlaceholder name={fl.name} size={52} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${fl._id}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fl.name}
            </div>
          </Link>
          {fl.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "var(--text-muted)",
                marginTop: 3,
              }}
            >
              <FiMapPin size={12} /> {fl.location}
            </div>
          )}
          {fl.hourlyRate > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "var(--amber)",
                fontWeight: 600,
                fontSize: 15,
                marginTop: 3,
              }}
            >
              <FiDollarSign size={13} /> {fl.hourlyRate}/hr
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {fl.bio ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {fl.bio}
        </p>
      ) : (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          No bio provided
        </p>
      )}

      {/* Skills */}
      {fl.skills?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {fl.skills.slice(0, 4).map((s) => (
            <span
              key={s}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-hover)",
                color: "var(--text-secondary)",
                fontSize: 12,
                border: "1px solid var(--border)",
              }}
            >
              {s}
            </span>
          ))}
          {fl.skills.length > 4 && (
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                padding: "3px 4px",
              }}
            >
              +{fl.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <Link
        to={`/profile/${fl._id}`}
        className="btn btn-secondary btn-sm"
        style={{ justifyContent: "center", marginTop: "auto" }}
      >
        <FiExternalLink size={13} /> View Profile
      </Link>
      <Link
        to={`/jobs/create?freelancerId=${encodeURIComponent(fl._id)}&freelancerName=${encodeURIComponent(fl.name)}`}
        className="btn btn-primary btn-sm"
        style={{ justifyContent: "center" }}
      >
        Hire Talent
      </Link>
    </div>
  );
}
