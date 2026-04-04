/**
 * seedData/jobs.js
 *
 * Factory function that receives an array of client MongoDB _id strings
 * and returns 15 realistic job postings distributed across those clients.
 *
 * Usage:  const jobsData = createJobs(clientIds);
 *
 * We use a factory (not a plain array) because job documents require a
 * valid client ObjectId reference, which we only know after clients are
 * inserted into the DB during seeding.
 *
 * Client index mapping:
 *   clients[0] = Sophia Bennett  (Nova Startups — SaaS/product studio)
 *   clients[1] = Marcus Reid     (Reid Growth Co — digital marketing)
 *   clients[2] = Priya Kapoor   (FinLedger — fintech)
 *   clients[3] = Daniel Osei    (Create Studio — video production)
 *   clients[4] = Elena Morozova (ShopBlocks — e-commerce platform)
 */

const createJobs = (clientIds) => {
  // Helper: returns a future date N days from now
  const futureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  return [
    // ── Job 1: Sophia (Nova Startups) ────────────────────────────────────────
    {
      title: 'Senior React Developer for SaaS Dashboard Rebuild',
      description: `We're rebuilding the core dashboard of our project-management SaaS from scratch using React 18 and TypeScript. The current dashboard is slow, hard to maintain, and doesn't scale. We need a senior React developer to lead this effort.

Responsibilities:
- Architect and build a component library from our Figma design system
- Implement complex data-visualisation views using Recharts or Victory
- Integrate with our existing REST API (Node.js/Express)
- Write unit and integration tests with React Testing Library + Jest
- Work closely with our designer and backend engineer in a Slack-first async environment

You will be given full ownership of the frontend. We want someone who can make decisions, not just execute tickets. Must be comfortable with code reviews and pair programming.`,
      client: clientIds[0],
      category: 'Web Development',
      skills: ['React', 'TypeScript', 'Recharts', 'REST API', 'Jest', 'CSS-in-JS', 'Figma'],
      budgetType: 'hourly',
      budgetMin: 75,
      budgetMax: 100,
      deadline: futureDate(45),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 2: Sophia (Nova Startups) ────────────────────────────────────────
    {
      title: 'Node.js Backend Engineer — API Development & Optimisation',
      description: `Nova Startups is building a new product in the HR-tech space and we need a strong Node.js backend engineer to join the team for a 3-month engagement.

The role involves:
- Designing and building RESTful APIs consumed by React web app and React Native mobile app
- Integrating with third-party services: Stripe, SendGrid, and HubSpot
- Writing database migrations and managing schema in PostgreSQL with Prisma ORM
- Setting up Redis caching for performance-critical endpoints
- Writing API documentation in OpenAPI/Swagger format

We work in 2-week sprints. You should be comfortable with GitHub flow, pull requests, and async communication. We're fully remote across US and European time zones.`,
      client: clientIds[0],
      category: 'Web Development',
      skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'Stripe', 'REST API', 'Docker'],
      budgetType: 'hourly',
      budgetMin: 70,
      budgetMax: 95,
      deadline: futureDate(60),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 3: Marcus (Reid Growth Co) ───────────────────────────────────────
    {
      title: 'SEO Content Writer — B2B SaaS Niche (10 Articles/Month)',
      description: `We are a digital marketing agency managing content for 4 B2B SaaS clients. We need a reliable, research-driven SEO writer who can produce 10 high-quality long-form articles per month (minimum 1,500 words each).

Topics span: project management software, CRM tools, HR software, and business intelligence platforms. You do not need to be a technical expert, but you must be able to understand and clearly explain software concepts.

Requirements:
- Demonstrated experience writing for SaaS or tech companies
- Familiarity with on-page SEO (keyword placement, internal linking, meta descriptions)
- Ability to follow a detailed content brief independently
- Fast turnaround: first draft within 5 business days of receiving a brief
- Native or near-native English speaker

Please share 2–3 relevant writing samples with your proposal.`,
      client: clientIds[1],
      category: 'Writing & Translation',
      skills: ['SEO Writing', 'Content Strategy', 'B2B Writing', 'Long-form Content', 'WordPress'],
      budgetType: 'fixed',
      budgetMin: 1500,
      budgetMax: 2500,
      deadline: futureDate(30),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 4: Marcus (Reid Growth Co) ───────────────────────────────────────
    {
      title: 'Google & Meta Ads Manager for E-commerce Brand (Ongoing)',
      description: `We are hiring a performance marketing manager to handle paid acquisition for one of our e-commerce clients, a UK-based premium skincare brand with a monthly ad budget of £25,000–£35,000.

Current channels: Google Shopping, Search, and Meta (Facebook/Instagram). You will take over from our in-house team who are moving to a different project.

What you will do:
- Audit current campaigns and identify waste / opportunities
- Restructure campaigns for better efficiency (target ROAS ≥ 4x)
- Run creative testing on Meta using our in-house UGC content library
- Weekly reporting with clear attribution analysis
- Monthly strategy calls with our client

This is an ongoing retainer engagement, initially for 3 months with extension if results are strong. Please include your most relevant case study in your proposal.`,
      client: clientIds[1],
      category: 'Digital Marketing',
      skills: ['Google Ads', 'Meta Ads', 'Google Shopping', 'Analytics', 'CRO', 'Klaviyo'],
      budgetType: 'fixed',
      budgetMin: 2000,
      budgetMax: 3500,
      deadline: futureDate(14),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 5: Priya (FinLedger) ──────────────────────────────────────────────
    {
      title: 'Senior Python Backend Engineer — Fintech API Platform',
      description: `FinLedger is a fast-growing fintech startup building cloud-native accounting infrastructure for SMBs. We process millions of transactions daily and are expanding our API platform.

We need a senior Python engineer to help us:
- Build new microservices with FastAPI, deployed on AWS Lambda and ECS
- Integrate with banking APIs (Plaid, Truelayer) and accounting software (Xero, QuickBooks)
- Improve test coverage of our existing Django codebase (currently at 60%, target 90%)
- Design and implement event-driven architecture using AWS SQS and SNS
- Review pull requests and mentor two junior engineers

You must be comfortable working in a regulated environment with strict data security requirements. Fintech or banking experience is strongly preferred. We operate on UK/US time zones.`,
      client: clientIds[2],
      category: 'Web Development',
      skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'AWS', 'Microservices', 'Plaid API', 'Docker'],
      budgetType: 'hourly',
      budgetMin: 90,
      budgetMax: 130,
      deadline: futureDate(21),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 6: Priya (FinLedger) ──────────────────────────────────────────────
    {
      title: 'Penetration Tester — Web App & API Security Audit',
      description: `FinLedger is preparing for our SOC 2 Type II audit and requires a comprehensive penetration test of our web application and API before submitting for certification.

Scope:
- Full web application penetration test (OWASP Top 10)
- API security assessment (REST and WebSocket endpoints)
- Authentication and authorisation bypass testing
- Business logic vulnerability assessment
- Cloud infrastructure review (AWS configuration)

Deliverables:
- Executive summary report
- Technical findings with CVSS scores
- Step-by-step reproduction steps for all findings
- Remediation recommendations prioritised by severity
- Retest of critical and high findings after we fix them

Timeline: We need the initial report within 10 business days of kick-off. We will provide full test environment access and a non-disclosure agreement.`,
      client: clientIds[2],
      category: 'Cybersecurity',
      skills: ['Penetration Testing', 'OWASP', 'Burp Suite', 'AWS Security', 'API Security', 'Web App Security'],
      budgetType: 'fixed',
      budgetMin: 3000,
      budgetMax: 6000,
      deadline: futureDate(20),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 7: Priya (FinLedger) ──────────────────────────────────────────────
    {
      title: 'React Native Developer — Mobile Banking App (iOS & Android)',
      description: `We are launching a mobile companion app for FinLedger that allows SMB owners to view their financial dashboard, approve expenses, and receive alerts on the go.

We need an experienced React Native developer to build this app from a detailed Figma design. Our backend APIs are already built (REST, documented in Swagger).

App features to build:
- Biometric authentication (Face ID / Fingerprint)
- Real-time transaction feed with push notifications (Firebase)
- Expense approval workflow with role-based access
- Interactive charts for cash flow and P&L
- Offline-first architecture with sync

We expect the project to take 8–12 weeks for a single skilled developer. Our designer will be available for questions. You will own the codebase end-to-end.`,
      client: clientIds[2],
      category: 'Mobile Development',
      skills: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'iOS', 'Android', 'Biometrics', 'REST API'],
      budgetType: 'fixed',
      budgetMin: 8000,
      budgetMax: 14000,
      deadline: futureDate(90),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 8: Daniel (Create Studio) ────────────────────────────────────────
    {
      title: 'Motion Designer — Brand Intro Animation Package',
      description: `Create Studio is producing a brand identity film for a major West African telecommunications company. We need a skilled motion designer to create the animated elements that will be used across multiple deliverables.

What we need:
- 5-second logo animation (2 versions: light and dark)
- Animated lower thirds package (10 templates)
- Animated intro/outro for long-form video (15 seconds each)
- Transition pack (10 custom transitions)
- Social media stinger animations (3 formats: 1:1, 9:16, 16:9)

All source files must be delivered in After Effects. We will also need an exported Premiere Pro motion graphics template (.mogrt) for each item.

Style reference: Clean, modern, corporate with Afrocentric design influences. Full brand guidelines and asset kit will be provided on project kick-off.`,
      client: clientIds[3],
      category: 'Video & Animation',
      skills: ['After Effects', 'Adobe Premiere Pro', 'Motion Graphics', 'Logo Animation', 'Brand Design'],
      budgetType: 'fixed',
      budgetMin: 1800,
      budgetMax: 3000,
      deadline: futureDate(25),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 9: Daniel (Create Studio) ────────────────────────────────────────
    {
      title: 'Video Editor — YouTube Documentary Series (3 Episodes)',
      description: `Create Studio is producing a 3-part documentary series about African tech entrepreneurs for a YouTube channel with 850k subscribers. Each episode is 18–22 minutes long.

We have all footage shot and ready. We need an experienced documentary editor who can:
- Assemble rough cuts from detailed paper edits we will provide
- Handle multi-camera edits (interviews + B-roll + archival footage)
- Colour grade footage shot across 3 different African cities (different lighting conditions)
- Sound design and audio mixing (we have a music library licence)
- Create engaging chapter markers and YouTube end screens
- Export in multiple formats (YouTube 4K, Instagram Reel clips)

Strong storytelling instinct is essential. We are not just cutting clips together — we are crafting a narrative. Please link to a long-form documentary or interview-style edit in your proposal.`,
      client: clientIds[3],
      category: 'Video & Animation',
      skills: ['DaVinci Resolve', 'Adobe Premiere Pro', 'Color Grading', 'Sound Design', 'Documentary Editing', 'YouTube'],
      budgetType: 'fixed',
      budgetMin: 2500,
      budgetMax: 4000,
      deadline: futureDate(35),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 10: Elena (ShopBlocks) ────────────────────────────────────────────
    {
      title: 'Full-Stack Engineer — Merchant Analytics Dashboard',
      description: `ShopBlocks is building a new analytics dashboard for our 40,000+ merchants. Think Shopify Analytics but more powerful. We want merchants to understand their sales performance, customer behaviour, and inventory health at a glance.

Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS on the frontend. Node.js/Express with PostgreSQL on the backend. We use Chart.js for visualisations (open to alternatives).

Features to build:
- Revenue overview with date range comparison
- Top products, top customers, and geographic sales maps
- Cohort retention analysis
- Inventory alerts and low-stock predictions
- CSV export for all report types
- Role-based access (merchant admin vs. staff)

We have detailed Figma mockups and a backend engineer who will expose the data APIs. Your focus is primarily on the frontend dashboard but you should be comfortable reviewing and occasionally modifying backend routes.`,
      client: clientIds[4],
      category: 'Web Development',
      skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Chart.js', 'PostgreSQL', 'REST API', 'Figma'],
      budgetType: 'fixed',
      budgetMin: 6000,
      budgetMax: 10000,
      deadline: futureDate(55),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 11: Elena (ShopBlocks) ────────────────────────────────────────────
    {
      title: 'UI/UX Designer — Checkout Flow Redesign',
      description: `ShopBlocks checkout conversion rate is 3.1% below industry benchmark. We have done user research (session recordings, heat maps, exit surveys) and we know where the friction is. We need a product designer to translate those findings into a redesigned checkout experience.

Project scope:
- Review existing research findings and add any missing discovery (2-week discovery phase)
- Redesign checkout flow for desktop and mobile (Figma)
- Design a simplified 1-page checkout (vs. current 3-step flow)
- Design for guest checkout, social login, and saved payment methods
- Produce a complete interaction prototype for usability testing
- Hand off detailed specs to our engineering team

We are looking for someone with a strong portfolio of e-commerce or conversion-focused design work. Experience with A/B testing is a plus.`,
      client: clientIds[4],
      category: 'Design & Creative',
      skills: ['Figma', 'UI/UX Design', 'E-commerce', 'Prototyping', 'User Research', 'Conversion Optimisation'],
      budgetType: 'fixed',
      budgetMin: 3500,
      budgetMax: 6000,
      deadline: futureDate(40),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 12: Elena (ShopBlocks) ────────────────────────────────────────────
    {
      title: 'Data Analyst — Customer Segmentation & LTV Modelling',
      description: `ShopBlocks wants to help our merchants understand their customers better. We are building a customer intelligence product and need a data analyst to lay the analytical foundation.

Your work:
- Analyse transaction data from 500+ merchant stores (anonymised, in our data warehouse)
- Build customer segmentation model using RFM analysis and clustering
- Calculate customer lifetime value (LTV) predictions per segment
- Build cohort retention dashboards in our BI tool (Metabase)
- Write a clear methodology document so our engineers can productise the model

Tech: PostgreSQL data warehouse, dbt for transformations, Metabase for dashboarding, Python for modelling (we prefer pandas + scikit-learn).

This is a 6–8 week project. The right person combines strong analytical rigour with the ability to communicate findings clearly to a non-technical product team.`,
      client: clientIds[4],
      category: 'Data Science & Analytics',
      skills: ['Python', 'SQL', 'dbt', 'Metabase', 'Customer Segmentation', 'LTV Modelling', 'pandas', 'scikit-learn'],
      budgetType: 'fixed',
      budgetMin: 4000,
      budgetMax: 7000,
      deadline: futureDate(50),
      status: 'open',
      location: 'remote',
      experienceLevel: 'intermediate',
    },

    // ── Job 13: Sophia (Nova Startups) — in_progress ─────────────────────────
    {
      title: 'DevOps Engineer — AWS Infrastructure Setup & CI/CD Pipeline',
      description: `We are launching a new SaaS product and need to set up our entire AWS infrastructure from scratch. We want it done right — scalable, secure, and properly monitored — so we are not rebuilding it in 12 months.

Infrastructure to build:
- VPC with public/private subnets, NAT gateway, and security groups
- ECS Fargate cluster for containerised Node.js services
- RDS PostgreSQL (Multi-AZ for production)
- ElastiCache Redis cluster
- S3 + CloudFront for static assets
- GitHub Actions CI/CD pipeline: test → build → push to ECR → deploy to ECS
- CloudWatch dashboards, alarms, and PagerDuty integration
- Terraform for all infrastructure (IaC)

We want the entire setup documented so our team can maintain it. Estimated 4–6 weeks for a skilled DevOps engineer.`,
      client: clientIds[0],
      category: 'Cloud & DevOps',
      skills: ['AWS', 'Terraform', 'Docker', 'ECS', 'GitHub Actions', 'CI/CD', 'PostgreSQL', 'Monitoring'],
      budgetType: 'fixed',
      budgetMin: 5000,
      budgetMax: 9000,
      deadline: futureDate(42),
      status: 'in_progress',
      location: 'remote',
      experienceLevel: 'expert',
    },

    // ── Job 14: Marcus (Reid Growth Co) — entry level ────────────────────────
    {
      title: 'Junior Social Media Content Creator — Instagram & TikTok',
      description: `We are looking for a creative and trend-savvy social media content creator to join our agency on a flexible freelance basis. You will create content for 2 of our lifestyle brand clients (health supplements and home décor).

What you will create:
- 12 Instagram posts per month per brand (copy + image direction)
- 8 Instagram/TikTok Reel scripts per month per brand
- Monthly content calendar with theme and caption planning

You do not need to shoot video — our clients have UGC creators for that. Your role is scripting, captioning, hashtag strategy, and content calendar planning.

This is a great role for someone earlier in their career who wants real agency experience. We care more about your creativity and understanding of trends than years on your CV. Show us content you have created or ideas you would pitch for a health supplement brand.`,
      client: clientIds[1],
      category: 'Digital Marketing',
      skills: ['Social Media', 'Copywriting', 'Content Strategy', 'Instagram', 'TikTok', 'Canva'],
      budgetType: 'fixed',
      budgetMin: 800,
      budgetMax: 1400,
      deadline: futureDate(10),
      status: 'open',
      location: 'remote',
      experienceLevel: 'entry',
    },

    // ── Job 15: Priya (FinLedger) ─────────────────────────────────────────────
    {
      title: 'Blockchain Developer — Smart Contract Audit & DeFi Integration',
      description: `FinLedger is exploring a DeFi treasury management feature for our enterprise clients. We need an experienced blockchain developer to:

Phase 1 (Audit — 2 weeks):
- Audit our existing Solidity smart contracts (3 contracts, ~800 lines total)
- Produce a formal audit report with severity ratings
- Recommend gas optimisations

Phase 2 (Development — 4–6 weeks):
- Build a multi-sig treasury contract with timelocks and spending limits
- Integrate with Aave and Compound for yield strategies
- Build a React frontend for treasury managers to interact with contracts
- Write comprehensive test suite in Hardhat (target 100% branch coverage)

You must have experience auditing production contracts and a deep understanding of ERC standards and DeFi protocol integrations. Please share any previous audit reports or on-chain projects you have worked on.`,
      client: clientIds[2],
      category: 'Blockchain',
      skills: ['Solidity', 'Hardhat', 'DeFi', 'Smart Contract Audit', 'ethers.js', 'Aave', 'React', 'Web3.js'],
      budgetType: 'fixed',
      budgetMin: 8000,
      budgetMax: 15000,
      deadline: futureDate(70),
      status: 'open',
      location: 'remote',
      experienceLevel: 'expert',
    },
  ];
};

module.exports = createJobs;