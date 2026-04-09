/**
 * pages/LandingPage.js
 * Public home page. Hero, feature highlights, CTA sections.
 */
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FiArrowRight,
  FiCode,
  FiPenTool,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiGlobe,
} from "react-icons/fi";
import "./LandingPage.css";

const CATEGORIES = [
  { icon: <FiCode size={20} />, name: "Web Development", count: "2.4k jobs" },
  {
    icon: <FiPenTool size={20} />,
    name: "Design & Creative",
    count: "1.8k jobs",
  },
  {
    icon: <FiTrendingUp size={20} />,
    name: "Digital Marketing",
    count: "900 jobs",
  },
  {
    icon: <FiGlobe size={20} />,
    name: "Writing & Translation",
    count: "1.2k jobs",
  },
  {
    icon: <FiZap size={20} />,
    name: "AI & Machine Learning",
    count: "600 jobs",
  },
  { icon: <FiShield size={20} />, name: "Cybersecurity", count: "400 jobs" },
];

export default function LandingPage() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-glow" />
        <div className="hero-content page-enter">
          <div className="hero-eyebrow">
            <span className="badge badge-amber">
              ✦ The Modern Freelance Platform
            </span>
          </div>
          <h1 className="hero-title">
            Where great work
            <br />
            <em>finds great talent</em>
          </h1>
          <p className="hero-subtitle">
            Connect with elite freelancers and ambitious clients. Post jobs,
            submit proposals, build careers — all in one place.
          </p>
          <div className="hero-cta">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Browse Jobs <FiArrowRight size={18} />
            </Link>
            <Link to="/freelancers" className="btn btn-secondary btn-lg">
              Hire Talent
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg">
              Post a Job
            </Link>
          </div>
          <div className="hero-stats">
            <HeroStat value="12,000+" label="Active freelancers" />
            <div className="hero-stat-div" />
            <HeroStat value="5,400+" label="Jobs posted" />
            <div className="hero-stat-div" />
            <HeroStat value="98%" label="Client satisfaction" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Explore by category</h2>
            <p className="section-subtitle">
              Thousands of opportunities across every discipline
            </p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/jobs?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.count}</div>
                <FiArrowRight size={14} className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="landing-section"
        style={{ background: "var(--bg-surface)", padding: "80px 0" }}
      >
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Simple, transparent, effective</p>
          </div>
          <div className="how-grid">
            <HowStep
              n="01"
              title="Post your job"
              desc="Describe what you need, set your budget, and get matched with talent in minutes."
              role="client"
            />
            <HowStep
              n="02"
              title="Review proposals"
              desc="Freelancers send tailored applications. Compare rates, portfolios, and experience."
              role="client"
            />
            <HowStep
              n="03"
              title="Hire & collaborate"
              desc="Accept your favourite applicant, agree on terms, and start working together."
              role="client"
            />
          </div>
          <div className="how-divider">
            <span className="badge badge-muted">For Freelancers</span>
          </div>
          <div className="how-grid">
            <HowStep
              n="01"
              title="Build your profile"
              desc="Showcase your skills, portfolio, and rate to stand out to the right clients."
              role="freelancer"
            />
            <HowStep
              n="02"
              title="Find matching jobs"
              desc="Browse hundreds of jobs filtered by category, budget, and experience level."
              role="freelancer"
            />
            <HowStep
              n="03"
              title="Submit proposals"
              desc="Send a personalised cover letter and bid. Track all your applications in one place."
              role="freelancer"
            />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div
          className="landing-container"
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 48px)",
              marginBottom: 16,
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 32,
              fontSize: 16,
            }}
          >
            Join thousands of clients and freelancers already on FreelanceHub.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/freelancers" className="btn btn-secondary btn-lg">
              Hire Talent
            </Link>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Free Account <FiArrowRight size={18} />
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-lg">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                color: "var(--text-secondary)",
              }}
            >
              Freelance<span style={{ color: "var(--amber)" }}>Hub</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              © {new Date().getFullYear()} FreelanceHub. Built with React +
              Node.js.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const HeroStat = ({ value, label }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 28,
        color: "var(--text-primary)",
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
      {label}
    </div>
  </div>
);

const HowStep = ({ n, title, desc }) => (
  <div className="how-step">
    <div className="how-n">{n}</div>
    <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{title}</h4>
    <p
      style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}
    >
      {desc}
    </p>
  </div>
);
