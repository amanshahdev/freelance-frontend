/**
 * seedData/freelancers.js
 *
 * 12 realistic freelancer profiles spanning different disciplines:
 * web dev, mobile, design, data science, DevOps, writing, marketing.
 * Each has a genuine-sounding bio, relevant skills, hourly rate,
 * and 2–3 portfolio items.
 *
 * Password for ALL seed accounts: Password123
 */

const freelancers = [
  // ── 1. Senior Full-Stack Engineer ──────────────────────────────────────────
  {
    name: 'James Okafor',
    email: 'james@jamesokafor.dev',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Full-stack engineer with 7 years of experience building scalable web applications. I specialise in React/Node.js and have shipped products used by hundreds of thousands of users. Previously senior engineer at Andela. I write clean, tested, documented code and communicate proactively.',
    location: 'Lagos, Nigeria',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
    hourlyRate: 85,
    portfolio: [
      {
        title: 'TalentFlow — Hiring Platform',
        url: 'https://github.com/jamesokafor/talentflow',
        description: 'End-to-end hiring platform built with Next.js, Node.js, and PostgreSQL. Handles 50k+ monthly active users.',
      },
      {
        title: 'PocketLedger — Personal Finance App',
        url: 'https://pocketledger.vercel.app',
        description: 'React + Express app with Plaid integration for automatic transaction categorisation.',
      },
      {
        title: 'OpenMenu — Restaurant SaaS',
        url: 'https://openmenu.io',
        description: 'Multi-tenant SaaS for restaurant digital menus. Built with Next.js, Stripe, and Supabase.',
      },
    ],
  },

  // ── 2. UI/UX Designer ──────────────────────────────────────────────────────
  {
    name: 'Amara Silva',
    email: 'amara@amaradesigns.co',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Product designer with 5 years creating intuitive digital experiences for SaaS startups. I work across the full design process — user research, wireframes, high-fidelity UI, and design systems. Figma expert. I care deeply about accessibility and have led design for two products that reached 100k+ users.',
    location: 'Lisbon, Portugal',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Framer', 'Webflow', 'Accessibility'],
    hourlyRate: 75,
    portfolio: [
      {
        title: 'Lumio Design System',
        url: 'https://www.figma.com/community/file/lumio-design-system',
        description: 'Open-source design system built for fintech products. 200+ components, dark/light mode, WCAG AA compliant.',
      },
      {
        title: 'Carto — Mapping SaaS Redesign',
        url: 'https://amaradesigns.co/case-studies/carto',
        description: 'Full product redesign that increased user activation by 34% in A/B testing.',
      },
    ],
  },

  // ── 3. React Native Mobile Developer ──────────────────────────────────────
  {
    name: 'Kevin Tran',
    email: 'kevin@kevintrandev.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Mobile developer specialising in React Native with 5 years of cross-platform app development. I have published 8 apps to both the App Store and Google Play, ranging from health trackers to e-commerce apps. I write performance-optimised code and always deliver with Expo or bare workflow depending on project needs.',
    location: 'Ho Chi Minh City, Vietnam',
    skills: ['React Native', 'Expo', 'TypeScript', 'Firebase', 'Redux', 'iOS', 'Android', 'REST APIs'],
    hourlyRate: 65,
    portfolio: [
      {
        title: 'RunTrackr — Fitness App',
        url: 'https://apps.apple.com/app/runtrackr',
        description: 'GPS-based running tracker with social features. 15k+ downloads on iOS and Android.',
      },
      {
        title: 'SnapShelf — Inventory Manager',
        url: 'https://play.google.com/store/apps/snapshelf',
        description: 'Camera-based inventory management app for small retailers. Integrates with Shopify.',
      },
    ],
  },

  // ── 4. Data Scientist / ML Engineer ───────────────────────────────────────
  {
    name: 'Dr. Fatima Al-Rashid',
    email: 'fatima@fatimadata.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Data scientist and ML engineer with a PhD in Computational Statistics and 6 years of industry experience. I specialise in building production-ready machine learning pipelines, NLP models, and data dashboards. Former lead data scientist at a Series B healthtech startup. Published researcher in anomaly detection.',
    location: 'Dubai, UAE',
    skills: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'PyTorch', 'SQL', 'Tableau', 'Apache Spark', 'scikit-learn'],
    hourlyRate: 110,
    portfolio: [
      {
        title: 'Churn Prediction Model — SaaS Client',
        url: 'https://fatimadata.com/projects/churn',
        description: 'XGBoost-based churn model reducing customer attrition by 18% for a 200k-user SaaS platform.',
      },
      {
        title: 'Medical NLP Pipeline',
        url: 'https://github.com/fatima-alrashid/med-nlp',
        description: 'BERT-based pipeline for extracting clinical entities from unstructured doctor notes. 94% F1 score.',
      },
    ],
  },

  // ── 5. DevOps / Cloud Engineer ─────────────────────────────────────────────
  {
    name: 'Arjun Mehta',
    email: 'arjun@arjunops.io',
    password: 'Password123',
    role: 'freelancer',
    bio: 'AWS-certified DevOps engineer with 6 years of experience building robust CI/CD pipelines and cloud infrastructure. I help startups migrate to the cloud, reduce infrastructure costs, and achieve 99.9% uptime. Specialise in Kubernetes, Terraform, and GitHub Actions. Have saved clients an average of 40% on AWS bills.',
    location: 'Bangalore, India',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'GitHub Actions', 'Linux', 'Nginx', 'Monitoring'],
    hourlyRate: 90,
    portfolio: [
      {
        title: 'Zero-Downtime Migration — E-commerce Platform',
        url: 'https://arjunops.io/case-studies/ecommerce-migration',
        description: 'Migrated a 500k-user e-commerce platform from on-premise to AWS EKS with zero downtime.',
      },
      {
        title: 'Open-Source Terraform Modules',
        url: 'https://github.com/arjunmehta/tf-modules',
        description: 'Production-ready Terraform modules for AWS VPC, EKS, and RDS. 400+ GitHub stars.',
      },
    ],
  },

  // ── 6. Copywriter / Content Strategist ────────────────────────────────────
  {
    name: 'Chloe Dupont',
    email: 'chloe@chloewritesco.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'B2B SaaS copywriter and content strategist with 6 years helping tech companies grow through content. I write website copy, email sequences, case studies, and long-form SEO articles that convert. Clients have seen up to 3x organic traffic growth after working with me. Bilingual: English and French.',
    location: 'Paris, France',
    skills: ['Copywriting', 'SEO Writing', 'Content Strategy', 'Email Marketing', 'B2B Writing', 'Case Studies', 'French', 'WordPress'],
    hourlyRate: 70,
    portfolio: [
      {
        title: 'SaaS Homepage Rewrite — 40% Conversion Lift',
        url: 'https://chloewritesco.com/work/saas-homepage',
        description: 'Complete homepage copy overhaul for a project management SaaS, resulting in 40% more trial signups.',
      },
      {
        title: 'Fintech Content Hub — 50 Articles',
        url: 'https://chloewritesco.com/work/fintech-hub',
        description: '50-article SEO content strategy and execution for a UK fintech. Grew organic traffic from 2k to 28k/month.',
      },
    ],
  },

  // ── 7. WordPress / Webflow Developer ──────────────────────────────────────
  {
    name: 'Tom Nakamura',
    email: 'tom@tomnakamura.studio',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Web developer focused on no-code and low-code builds using Webflow and WordPress. I build fast, beautiful, conversion-optimised websites without writing a line of unnecessary code. Perfect for startups and marketing sites that need to launch in weeks, not months. Pixel-perfect Figma to Webflow handoffs are my speciality.',
    location: 'Tokyo, Japan',
    skills: ['Webflow', 'WordPress', 'PHP', 'WooCommerce', 'JavaScript', 'CSS', 'Figma to Webflow', 'SEO'],
    hourlyRate: 55,
    portfolio: [
      {
        title: 'LaunchKit — SaaS Marketing Site',
        url: 'https://launchkit.io',
        description: 'Webflow build for a SaaS product, live in 2 weeks. Scored 98/100 on PageSpeed Insights.',
      },
      {
        title: 'Bloom Botanics — E-commerce',
        url: 'https://bloombotanics.co',
        description: 'WooCommerce store with custom subscription plugin for a UK plant subscription box.',
      },
    ],
  },

  // ── 8. Blockchain / Smart Contract Developer ──────────────────────────────
  {
    name: 'Yusuf Ibrahim',
    email: 'yusuf@yusufweb3.dev',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Blockchain developer with 4 years building on Ethereum, Solana, and EVM-compatible chains. I write audited smart contracts in Solidity, build DeFi protocols, and develop NFT platforms. Previously worked with two top-20 DeFi protocols. All my contracts are tested with Hardhat and reviewed against OWASP standards.',
    location: 'Istanbul, Turkey',
    skills: ['Solidity', 'Ethereum', 'Hardhat', 'Web3.js', 'ethers.js', 'DeFi', 'NFT', 'Solana', 'Rust', 'IPFS'],
    hourlyRate: 120,
    portfolio: [
      {
        title: 'DexFlow — Decentralised Exchange',
        url: 'https://github.com/yusufibrahim/dexflow',
        description: 'AMM-based DEX built on Ethereum with liquidity pools and yield farming. Audited by CertiK.',
      },
      {
        title: 'ArtChain — NFT Marketplace',
        url: 'https://artchain.xyz',
        description: 'Full-stack NFT marketplace on Polygon with lazy minting and royalty enforcement.',
      },
    ],
  },

  // ── 9. Digital Marketing / Paid Ads Specialist ────────────────────────────
  {
    name: 'Grace Obi',
    email: 'grace@graceobimarketing.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Performance marketing specialist with 5 years running paid acquisition for e-commerce and SaaS brands. I manage Google Ads, Meta Ads, and TikTok Ads campaigns with budgets ranging from $5k to $500k/month. Average ROAS across my client portfolio is 4.2x. I am data-driven, transparent, and obsessed with incrementality testing.',
    location: 'London, UK',
    skills: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'SEO', 'Analytics', 'CRO', 'Email Marketing', 'Klaviyo', 'Shopify'],
    hourlyRate: 80,
    portfolio: [
      {
        title: 'Fashion Brand — $2M Google Ads Campaigns',
        url: 'https://graceobimarketing.com/work/fashion',
        description: 'Managed £1.8M annual Google Shopping spend, achieving 5.1x ROAS and 40% YoY revenue growth.',
      },
      {
        title: 'B2B SaaS — Meta Lead Gen',
        url: 'https://graceobimarketing.com/work/saas-leadgen',
        description: 'Reduced cost per qualified lead from $180 to $52 through iterative creative testing on Meta.',
      },
    ],
  },

  // ── 10. Cybersecurity Consultant ──────────────────────────────────────────
  {
    name: 'Nikolai Petrov',
    email: 'nikolai@secureniko.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Certified ethical hacker (CEH, OSCP) and penetration tester with 8 years of experience. I conduct web application pentests, network security audits, and cloud security reviews for startups and enterprises. I provide detailed reports with remediation steps, not just a list of CVEs. Worked with clients in fintech, healthcare, and government sectors.',
    location: 'Warsaw, Poland',
    skills: ['Penetration Testing', 'Web App Security', 'OWASP', 'Burp Suite', 'AWS Security', 'Docker Security', 'SAST/DAST', 'Python'],
    hourlyRate: 130,
    portfolio: [
      {
        title: 'Fintech Web App Pentest',
        url: 'https://secureniko.com/case-studies/fintech',
        description: 'Discovered and responsibly disclosed a critical SQL injection vulnerability in a payments API handling $10M/month.',
      },
      {
        title: 'AWS Cloud Security Audit',
        url: 'https://secureniko.com/case-studies/aws-audit',
        description: 'Comprehensive AWS configuration audit for a Series A startup, closing 23 critical misconfigurations.',
      },
    ],
  },

  // ── 11. Video Editor / Motion Designer ───────────────────────────────────
  {
    name: 'Isabelle Fontaine',
    email: 'isabelle@isabellevisuals.com',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Video editor and motion designer with 6 years creating compelling content for brands, agencies, and YouTube creators. I edit brand films, product ads, social media content, and explainer animations. Proficient in Premiere Pro, After Effects, and DaVinci Resolve. My explainer videos have accumulated over 5M combined views.',
    location: 'Montreal, Canada',
    skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', 'Color Grading', 'Storyboarding', 'Social Media Video', 'YouTube'],
    hourlyRate: 60,
    portfolio: [
      {
        title: 'Notion — Product Explainer Animation',
        url: 'https://isabellevisuals.com/work/notion',
        description: '90-second animated explainer produced for a Notion-style app launch. 800k organic views in first month.',
      },
      {
        title: 'Outdoor Brand — Campaign Reel',
        url: 'https://isabellevisuals.com/work/outdoor',
        description: 'Series of 15 short-form videos for an outdoor apparel brand, averaging 2M views per video on TikTok.',
      },
    ],
  },

  // ── 12. Backend Engineer (Python / Django) ────────────────────────────────
  {
    name: 'Lena Hoffmann',
    email: 'lena@lenahoffmann.dev',
    password: 'Password123',
    role: 'freelancer',
    bio: 'Backend-focused software engineer with 5 years building APIs and data pipelines in Python. I specialise in Django, FastAPI, and PostgreSQL. Experienced with high-throughput systems processing millions of events per day. I care about performance, security, and writing backend code that is a joy to maintain.',
    location: 'Munich, Germany',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'Docker', 'REST API', 'pytest'],
    hourlyRate: 95,
    portfolio: [
      {
        title: 'Event Processing Pipeline',
        url: 'https://lenahoffmann.dev/projects/event-pipeline',
        description: 'Celery + Redis pipeline processing 3M+ events/day for a real-time analytics platform.',
      },
      {
        title: 'Django Multi-Tenant SaaS Boilerplate',
        url: 'https://github.com/lenahoffmann/django-saas',
        description: 'Open-source Django multi-tenancy starter with subscriptions, role permissions, and audit logs. 600+ stars.',
      },
    ],
  },
];

module.exports = freelancers;