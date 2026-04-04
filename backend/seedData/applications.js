/**
 * seedData/applications.js
 *
 * Factory function that creates realistic applications linking
 * specific freelancers to specific jobs.
 *
 * Usage: const appsData = createApplications(freelancerIds, jobIds)
 *
 * We only create applications where the freelancer's skills
 * are genuinely relevant to the job — this makes the data
 * look authentic rather than random.
 *
 * Freelancer index → name mapping (matches order in freelancers.js):
 *   0 = James Okafor      (Full-stack JS)
 *   1 = Amara Silva       (UI/UX Designer)
 *   2 = Kevin Tran        (React Native)
 *   3 = Dr. Fatima        (Data Science / ML)
 *   4 = Arjun Mehta       (DevOps / AWS)
 *   5 = Chloe Dupont      (Copywriter)
 *   6 = Tom Nakamura      (Webflow / WordPress)
 *   7 = Yusuf Ibrahim     (Blockchain)
 *   8 = Grace Obi         (Performance Marketing)
 *   9 = Nikolai Petrov    (Cybersecurity)
 *  10 = Isabelle Fontaine (Video / Motion)
 *  11 = Lena Hoffmann     (Python Backend)
 *
 * Job index → title mapping (matches order in jobs.js):
 *   0  = Senior React Developer (Sophia)
 *   1  = Node.js Backend Engineer (Sophia)
 *   2  = SEO Content Writer (Marcus)
 *   3  = Google & Meta Ads Manager (Marcus)
 *   4  = Senior Python Backend (Priya)
 *   5  = Penetration Tester (Priya)
 *   6  = React Native Developer (Priya)
 *   7  = Motion Designer (Daniel)
 *   8  = Video Editor (Daniel)
 *   9  = Full-Stack Analytics Dashboard (Elena)
 *  10  = UI/UX Checkout Redesign (Elena)
 *  11  = Data Analyst LTV (Elena)
 *  12  = DevOps AWS Setup (Sophia) — in_progress, skip
 *  13  = Junior Social Media Creator (Marcus)
 *  14  = Blockchain Developer (Priya)
 */

const createApplications = (freelancerIds, jobIds) => [
  // ── Applications to Job 0: Senior React Developer ─────────────────────────
  {
    job:          jobIds[0],
    freelancer:   freelancerIds[0], // James Okafor — full-stack JS
    coverLetter: `Hi Sophia, I have been building production React applications for 7 years and I am very excited about this role. I recently rebuilt the entire frontend of TalentFlow (150k MAU) from a legacy class-component codebase to a modern hooks-based architecture with full TypeScript coverage, so I know exactly what your project involves.

I am particularly experienced with complex data visualisation — I have shipped dashboards using Recharts, Victory, and D3, and I can help you choose the right library for your performance requirements. I work async-first and am comfortable making architectural decisions independently.

My rate is $90/hr. I can start within 1 week. Happy to do a short paid trial task so you can assess my code quality before committing.`,
    proposedRate: 90,
    estimatedDays: 45,
    status: 'shortlisted',
    clientNote: 'Strong portfolio, great communication. Schedule a call.',
  },

  {
    job:          jobIds[0],
    freelancer:   freelancerIds[6], // Tom Nakamura — web dev (less ideal match)
    coverLetter: `Hello! I am a web developer with strong React experience on top of my Webflow work. I have built several complex React applications and I am comfortable with TypeScript and data visualisation libraries. My rate is at the lower end of your range which could help you get more done within budget.`,
    proposedRate: 75,
    estimatedDays: 50,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 1: Node.js Backend Engineer ───────────────────────
  {
    job:          jobIds[1],
    freelancer:   freelancerIds[0], // James Okafor — perfect match
    coverLetter: `Hi again! I saw you also posted a backend role. I would love to be considered for this one or both. I have built Node.js/TypeScript APIs consumed by React and React Native clients and have worked extensively with Prisma, Stripe, and SendGrid. My current project uses a very similar stack.

I am comfortable with your sprint-based workflow and have 5+ years of async-first remote work experience. I can provide references from two previous Node.js contracts on request.`,
    proposedRate: 85,
    estimatedDays: 60,
    status: 'pending',
    clientNote: '',
  },

  {
    job:          jobIds[1],
    freelancer:   freelancerIds[11], // Lena Hoffmann — Python backend, adjacent
    coverLetter: `While my primary expertise is Python, I have 3 years of professional Node.js/TypeScript experience and have built REST APIs integrated with Stripe, SendGrid, and PostgreSQL. I'm drawn to this role because the architecture challenges are similar to projects I've enjoyed most. I can demonstrate Node.js work samples on request. My proposed rate reflects a slight discount given the tech overlap.`,
    proposedRate: 80,
    estimatedDays: 65,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 2: SEO Content Writer ─────────────────────────────
  {
    job:          jobIds[2],
    freelancer:   freelancerIds[5], // Chloe Dupont — perfect match
    coverLetter: `Hi Marcus, I have been writing long-form SEO content for B2B SaaS companies for 6 years. My clients have included project management, CRM, and HR software companies, which maps directly to your client niches.

Here are three recent samples:
1. "How to Choose a CRM for Remote Teams" — ranked #2 on Google, 3,200 monthly visits
2. "Best HR Software for Small Businesses in 2024" — client saw 40% increase in organic trial signups
3. "Project Management Methodologies Explained" — featured snippet for 8 keywords

I deliver first drafts within 4 business days of receiving a brief, I never miss deadlines, and I use SurferSEO for on-page optimisation as standard. Available to start immediately.`,
    proposedRate: 2000,
    estimatedDays: 30,
    status: 'accepted',
    clientNote: 'Excellent samples. Relevant experience. Starting immediately.',
  },

  // ── Applications to Job 3: Google & Meta Ads Manager ─────────────────────
  {
    job:          jobIds[3],
    freelancer:   freelancerIds[8], // Grace Obi — perfect match
    coverLetter: `Hi Marcus, this brief is exactly my wheelhouse. I manage Google Shopping and Meta campaigns for premium lifestyle and beauty e-commerce brands, with budgets ranging from £10k to £500k/month. For a comparable skincare brand, I achieved 5.1x ROAS on Google Shopping and reduced Meta CPP by 38% through structured creative testing.

I have attached my most relevant case study. Key approach for this account:
1. Full audit in week 1 — I will show you exactly where the budget is leaking
2. Campaign restructure using Performance Max with custom audience signals
3. Meta: systematic creative testing framework (3 variables per test, min 7-day windows)

Available to start within 3 days. Happy to do a 30-min strategy call first.`,
    proposedRate: 3000,
    estimatedDays: 90,
    status: 'shortlisted',
    clientNote: 'Very strong. Strong case study. Arrange onboarding call.',
  },

  // ── Applications to Job 4: Senior Python Backend ──────────────────────────
  {
    job:          jobIds[4],
    freelancer:   freelancerIds[11], // Lena Hoffmann — perfect match
    coverLetter: `Hi Priya, I have 5 years of professional Python experience with Django and FastAPI, and fintech is my preferred domain. I've built event-driven microservices processing millions of financial transactions and have worked with both Plaid and Truelayer integrations in production.

On test coverage: I have taken three Django codebases from sub-50% to 90%+ coverage using pytest and factory_boy, so your 60% → 90% target is very achievable. I am also comfortable mentoring junior engineers — I currently mentor two engineers on a contract basis.

I am GDPR-familiar and comfortable signing NDA/DPA agreements. I have worked in regulated environments (FCA-supervised clients) before. Can start in 2 weeks.`,
    proposedRate: 100,
    estimatedDays: 60,
    status: 'shortlisted',
    clientNote: 'Fintech experience confirmed. Technical screen booked.',
  },

  {
    job:          jobIds[4],
    freelancer:   freelancerIds[0], // James Okafor — adjacent (Node not Python)
    coverLetter: `Hi Priya, while my primary stack is Node.js, I have strong Python experience from data engineering work and have built FastAPI services previously. I'm excited by the challenge of this role and the regulated-environment aspect aligns with a previous banking API project I worked on.`,
    proposedRate: 90,
    estimatedDays: 70,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 5: Penetration Tester ────────────────────────────
  {
    job:          jobIds[5],
    freelancer:   freelancerIds[9], // Nikolai Petrov — perfect match
    coverLetter: `Hi Priya, I am a certified penetration tester (CEH, OSCP) with 8 years of experience and significant fintech exposure — I have conducted assessments for 3 FCA-regulated firms. SOC 2 preparation pentests are a specific speciality of mine.

For engagements of this scope I typically deliver:
- Initial report: day 8 of the engagement
- Executive summary with business risk context (not just technical jargon)
- Full technical findings with CVSS 3.1 scores, PoC screenshots, and remediation guidance prioritised by effort vs. impact
- Free retest for all Critical and High findings within 30 days of report delivery

I am available to start within 5 business days. I will need to sign an NDA and receive a test environment URL, credentials, and API documentation to begin scoping accurately. Happy to jump on a call to discuss scope.`,
    proposedRate: 4500,
    estimatedDays: 14,
    status: 'accepted',
    clientNote: 'Exactly what we need. OSCP certified. Starting Monday.',
  },

  // ── Applications to Job 6: React Native Developer ─────────────────────────
  {
    job:          jobIds[6],
    freelancer:   freelancerIds[2], // Kevin Tran — perfect match
    coverLetter: `Hi Priya, building a secure, polished mobile banking app is exactly what I do. I have shipped 8 React Native apps to both stores, including two finance-adjacent apps (expense tracking and invoice management), and I have implemented biometric auth, push notifications, and offline-first sync in production.

The 8–12 week timeline you have estimated aligns with my experience for a feature set of this scope. I work with TypeScript from day one and write thorough Jest + Detox test coverage.

My proposed rate of $70/hr reflects my location advantage (Ho Chi Minh City, Vietnam) while giving you senior-level output. I am available to start in 1 week and will overlap with your UK timezone for 4 hours daily. Happy to share a TestFlight build of a recent project.`,
    proposedRate: 70,
    estimatedDays: 85,
    status: 'shortlisted',
    clientNote: 'Strong app portfolio. Overlap hours work. Proceed to code test.',
  },

  // ── Applications to Job 7: Motion Designer ───────────────────────────────
  {
    job:          jobIds[7],
    freelancer:   freelancerIds[10], // Isabelle Fontaine — perfect match
    coverLetter: `Hi Daniel, I have 6 years of motion design experience and have produced full brand identity animation packages for 12+ corporate clients. I work natively in After Effects and have delivered .mogrt exports for broadcast clients numerous times.

The Afrocentric modern-corporate direction you describe is something I am genuinely excited about — I will bring a unique, culturally resonant visual language rather than the generic corporate look. I will send a styleframe concept free of charge before you commit, so you can see my interpretation of the brief. My turnaround for a package of this scope is typically 3 weeks.`,
    proposedRate: 2400,
    estimatedDays: 21,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 8: Video Editor / Documentary ────────────────────
  {
    job:          jobIds[8],
    freelancer:   freelancerIds[10], // Isabelle Fontaine
    coverLetter: `Hi Daniel, documentary editing is where I am most at home. I have cut two long-form documentary series — one for a YouTube channel (620k subs) and one for a streaming platform. Both involved multi-city shoots with inconsistent lighting conditions, which is exactly the colour grading challenge you describe.

I edit in DaVinci Resolve for colour-critical work and Premiere Pro for fast assembly. I would love to share one of my documentary reels privately. My estimate of 5 weeks accounts for 3 rough cut rounds and 1 final picture lock per episode.`,
    proposedRate: 3200,
    estimatedDays: 35,
    status: 'shortlisted',
    clientNote: 'Great reel. Documentary experience confirmed. Discuss timeline.',
  },

  // ── Applications to Job 9: Full-Stack Analytics Dashboard ─────────────────
  {
    job:          jobIds[9],
    freelancer:   freelancerIds[0], // James Okafor
    coverLetter: `Hi Elena, I have built two analytics dashboards of similar complexity — one for a 40k-merchant e-commerce platform (interesting coincidence!) and one for a SaaS product with cohort retention views. I am comfortable with Next.js 14 App Router, TypeScript, and Tailwind, and have used Chart.js, Recharts, and Tremor in production.

I reviewed your Figma link (if you share access) and I am confident in the 8-week timeline for the feature set you have described. I work closely with product teams and can comfortably review backend routes when needed.`,
    proposedRate: 8000,
    estimatedDays: 55,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 10: UI/UX Checkout Redesign ──────────────────────
  {
    job:          jobIds[10],
    freelancer:   freelancerIds[1], // Amara Silva — perfect match
    coverLetter: `Hi Elena, checkout conversion design is a speciality I have developed over the last 3 years. I redesigned the checkout flow for two e-commerce clients — one saw a 28% lift in completed purchases, the other reduced cart abandonment by 19%. Both results were measured through A/B tests run by the client's growth team, not my estimates.

My process:
Week 1–2: Review your session recordings, heat maps, and exit survey data. Run 5 user interviews if budget allows.
Week 3–4: Wireframes and flow architecture. Review with your team.
Week 5–6: High-fidelity UI (desktop + mobile). Micro-interaction prototypes.
Week 7: Usability testing prototype. Iteration.
Week 8: Final handoff with annotated specs and a component inventory.

I am available to start in 2 weeks.`,
    proposedRate: 5000,
    estimatedDays: 40,
    status: 'shortlisted',
    clientNote: 'Exactly the experience we need. Strong case studies.',
  },

  // ── Applications to Job 11: Data Analyst LTV Modelling ───────────────────
  {
    job:          jobIds[11],
    freelancer:   freelancerIds[3], // Dr. Fatima Al-Rashid
    coverLetter: `Hi Elena, customer segmentation and LTV modelling are two of my most-used tools. I have built RFM + K-means hybrid segmentation models for three e-commerce clients, and LTV prediction models using survival analysis and XGBoost for a subscription commerce platform.

I am very comfortable with your stack: PostgreSQL + dbt + Metabase + pandas + scikit-learn. My deliverable will include not just the model and dashboards but a clear methodology document written for a non-technical product audience (this is something I take pride in). I can start in 1 week and estimate 6 weeks for a thorough engagement.`,
    proposedRate: 5500,
    estimatedDays: 42,
    status: 'pending',
    clientNote: '',
  },

  // ── Applications to Job 13: Junior Social Media Creator ──────────────────
  {
    job:          jobIds[13],
    freelancer:   freelancerIds[5], // Chloe Dupont — senior writer, overqualified but applies
    coverLetter: `Hi Marcus, I know this role is junior-focused and I am more senior, but I have a specific interest in health and wellness brand content and this looks like a fun project. I would bring a structured approach to content calendars and scripts that might benefit your agency clients. Happy to discuss a rate adjustment if my experience level is too much for the budget.`,
    proposedRate: 1200,
    estimatedDays: 30,
    status: 'rejected',
    clientNote: 'Overqualified for our needs. Budget does not match.',
  },

  // ── Applications to Job 14: Blockchain Developer ──────────────────────────
  {
    job:          jobIds[14],
    freelancer:   freelancerIds[7], // Yusuf Ibrahim — perfect match
    coverLetter: `Hi Priya, smart contract auditing and DeFi integrations are my core expertise. I have worked with Aave and Compound integrations in 3 separate projects and have conducted formal audits for two protocols. I can share my previous audit reports (with client permission) to demonstrate my process and rigour.

On the multi-sig treasury contract: I have built exactly this pattern before — a Gnosis Safe-compatible multi-sig with custom timelocks and per-signer spending limits. All my contracts achieve 100% branch coverage in Hardhat, and I include gas optimisation as standard.

Phase 1 audit: 2 weeks. Phase 2 development: 5 weeks. Total: 7 weeks. Happy to discuss a fixed price for the entire engagement for your budget certainty.`,
    proposedRate: 12000,
    estimatedDays: 49,
    status: 'shortlisted',
    clientNote: 'Previous audit reports look solid. Awaiting contract details.',
  },
];

module.exports = createApplications;