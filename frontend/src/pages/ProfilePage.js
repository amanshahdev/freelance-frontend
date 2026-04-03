/**
 * pages/ProfilePage.js
 * Public profile page for any user. Shows bio, skills, portfolio, stats.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import { LoadingSpinner } from '../components/SharedComponents';
import { userAPI, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiDollarSign, FiEdit, FiExternalLink, FiBriefcase, FiSend } from 'react-icons/fi';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = me && me._id === id;

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          userAPI.getProfile(id),
          userAPI.getUserStats(id),
        ]);
        setProfile(profileRes.data.user);
        setStats(statsRes.data.stats);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return (
    <div className="page-wrapper"><Navbar /><LoadingSpinner message="Loading profile…" /></div>
  );
  if (!profile) return null;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar + name card */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <AvatarPlaceholder name={profile.name} size={96} />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>{profile.name}</h1>
              <span className={`badge ${profile.role === 'client' ? 'badge-amber' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>
                {profile.role}
              </span>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, color: 'var(--text-muted)', fontSize: 14 }}>
                  <FiMapPin size={13} /> {profile.location}
                </div>
              )}
              {profile.role === 'freelancer' && profile.hourlyRate > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, color: 'var(--amber)', fontWeight: 600, fontSize: 16 }}>
                  <FiDollarSign size={14} /> ${profile.hourlyRate}/hr
                </div>
              )}
              {isOwnProfile && (
                <Link to="/profile/edit" className="btn btn-secondary btn-sm" style={{ marginTop: 16, justifyContent: 'center' }}>
                  <FiEdit size={13} /> Edit Profile
                </Link>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Stats</h4>
                {profile.role === 'client' ? (
                  <>
                    <StatRow icon={<FiBriefcase size={14} />} label="Jobs Posted" value={stats.totalJobs || 0} />
                    <StatRow icon={<FiBriefcase size={14} />} label="Open Jobs"   value={stats.openJobs || 0} />
                    <StatRow icon={<FiBriefcase size={14} />} label="Completed"   value={stats.completedJobs || 0} />
                  </>
                ) : (
                  <>
                    <StatRow icon={<FiSend size={14} />} label="Applied"   value={stats.totalApplications || 0} />
                    <StatRow icon={<FiSend size={14} />} label="Accepted"  value={stats.acceptedApplications || 0} />
                    <StatRow icon={<FiSend size={14} />} label="Pending"   value={stats.pendingApplications || 0} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Bio */}
            {profile.bio && (
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>About</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.skills.map(s => (
                    <span key={s} style={{
                      padding: '6px 16px', borderRadius: 'var(--radius-full)',
                      background: 'var(--amber-dim)', color: 'var(--amber)',
                      fontSize: 13, fontWeight: 500, border: '1px solid rgba(245,158,11,0.2)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 16 }}>Portfolio</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {profile.portfolio.map(item => (
                    <div key={item._id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)',
                      padding: '14px 16px', border: '1px solid var(--border)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                        {item.description && (
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.description}</div>
                        )}
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flexShrink: 0, marginLeft: 12 }}>
                        <FiExternalLink size={13} /> View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for own profile */}
            {isOwnProfile && !profile.bio && profile.skills?.length === 0 && profile.portfolio?.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Complete your profile</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                  Add a bio, skills, and portfolio to stand out to clients.
                </p>
                <Link to="/profile/edit" className="btn btn-primary"><FiEdit size={15} /> Edit Profile</Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const StatRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>{icon}{label}</span>
    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);
