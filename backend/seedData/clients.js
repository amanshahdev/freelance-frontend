/**
 * seedData/clients.js
 *
 * 5 realistic client companies across different industries.
 * Each has a plausible company email, bio, and location.
 * Password for ALL seed accounts: Password123
 * (bcrypt hash is applied automatically by the User pre-save hook)
 */

const clients = [
  {
    name: 'Sophia Bennett',
    email: 'sophia@novastartups.io',
    password: 'Password123',
    role: 'client',
    bio: 'Co-founder of Nova Startups, a product studio that launches 2–3 SaaS products per year. We work with a distributed team of freelancers to move fast without bloated payroll. Looking for reliable, self-managing engineers and designers.',
    location: 'San Francisco, CA',
    skills: [],
    hourlyRate: 0,
    portfolio: [],
  },
  {
    name: 'Marcus Reid',
    email: 'marcus@reidgrowthco.com',
    password: 'Password123',
    role: 'client',
    bio: 'Growth consultant running a boutique digital marketing agency. We manage campaigns for e-commerce brands doing $1M–$20M in annual revenue. Constantly hiring skilled copywriters, SEO specialists, and paid ads managers.',
    location: 'Austin, TX',
    skills: [],
    hourlyRate: 0,
    portfolio: [],
  },
  {
    name: 'Priya Kapoor',
    email: 'priya@finledger.tech',
    password: 'Password123',
    role: 'client',
    bio: 'CTO at FinLedger, a fintech startup building next-gen accounting tools for SMBs. We need senior backend engineers, security experts, and occasionally mobile developers to accelerate our roadmap.',
    location: 'New York, NY',
    skills: [],
    hourlyRate: 0,
    portfolio: [],
  },
  {
    name: 'Daniel Osei',
    email: 'daniel@createstudiogh.com',
    password: 'Password123',
    role: 'client',
    bio: 'Creative director running a video production studio based in Accra with remote clients worldwide. We produce brand films, product videos, and social media content for global brands. Always looking for motion designers and video editors.',
    location: 'Accra, Ghana',
    skills: [],
    hourlyRate: 0,
    portfolio: [],
  },
  {
    name: 'Elena Morozova',
    email: 'elena@shopblocks.eu',
    password: 'Password123',
    role: 'client',
    bio: 'Head of Product at ShopBlocks, a European e-commerce platform with 40k+ merchants. We regularly engage freelancers for feature development, data analysis, and UI/UX projects. We value clear communication and strong documentation.',
    location: 'Berlin, Germany',
    skills: [],
    hourlyRate: 0,
    portfolio: [],
  },
];

module.exports = clients;