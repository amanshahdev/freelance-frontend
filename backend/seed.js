/**
 * seed.js — Database Seed Script
 *
 * WHAT: Wipes and repopulates the MongoDB database with realistic
 *       sample data for portfolio demonstration.
 *
 * HOW:  Run with:  node seed.js
 *       Optional:  node seed.js --wipe   (wipe only, no reseed)
 *
 * STEPS:
 *   1. Load .env and connect to MongoDB
 *   2. Drop all documents from users, jobs, applications collections
 *   3. Insert client users  → capture their _id values
 *   4. Insert freelancers   → capture their _id values
 *   5. Insert jobs          → pass client _ids to factory function
 *   6. Insert applications  → pass freelancer + job _ids
 *   7. Print summary report
 *   8. Disconnect
 *
 * IMPORTANT:
 *   - Password for ALL seed accounts is:  Password123
 *   - The User model's pre-save hook hashes the password automatically,
 *     so we pass plain text here and Mongoose does the rest.
 *   - Never run this script against a production database with real user data.
 */

require('dotenv').config(); // Load MONGO_URI and other env vars from .env

const mongoose = require('mongoose');

// Models — must be imported so Mongoose registers the schemas
const User        = require('./models/User');
const Job         = require('./models/Job');
const Application = require('./models/Application');

// Seed data factories
const clientsData       = require('./seedData/clients');
const freelancersData   = require('./seedData/freelancers');
const createJobs        = require('./seedData/jobs');
const createApplications = require('./seedData/applications');

// ─── Utility: coloured console output ───────────────────────────────────────
const log = {
  info:    (msg) => console.log(`\x1b[36mℹ  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✓  ${msg}\x1b[0m`),
  warn:    (msg) => console.log(`\x1b[33m⚠  ${msg}\x1b[0m`),
  error:   (msg) => console.log(`\x1b[31m✗  ${msg}\x1b[0m`),
  header:  (msg) => console.log(`\n\x1b[1m\x1b[35m${msg}\x1b[0m`),
  divider: ()    => console.log('\x1b[90m' + '─'.repeat(50) + '\x1b[0m'),
};

// ─── Main seed function ──────────────────────────────────────────────────────
async function seed() {
  log.header('FreelanceHub Database Seeder');
  log.divider();

  // ── 1. Connect to MongoDB ──────────────────────────────────────────────────
  log.info('Connecting to MongoDB…');
  const uri = process.env.MONGO_URI;
  if (!uri) {
    log.error('MONGO_URI is not set in .env — aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  log.success(`Connected to: ${mongoose.connection.host}`);

  // ── 2. Wipe existing data ──────────────────────────────────────────────────
  log.header('Step 1 — Clearing existing data');

  const [deletedApps, deletedJobs, deletedUsers] = await Promise.all([
    Application.deleteMany({}),
    Job.deleteMany({}),
    User.deleteMany({}),
  ]);

  log.success(`Deleted ${deletedUsers.deletedCount} users`);
  log.success(`Deleted ${deletedJobs.deletedCount} jobs`);
  log.success(`Deleted ${deletedApps.deletedCount} applications`);

  // Handle --wipe flag: exit after clearing
  if (process.argv.includes('--wipe')) {
    log.warn('--wipe flag detected. Database cleared. Exiting without reseeding.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── 3. Seed clients ────────────────────────────────────────────────────────
  log.header('Step 2 — Seeding clients');

  // We use .create() which triggers the pre-save hook for password hashing
  // insertMany() would bypass pre-save hooks, so we must NOT use it for users
  const clients = [];
  for (const clientData of clientsData) {
    const client = await User.create(clientData);
    clients.push(client);
    log.success(`Created client: ${client.name} (${client.email})`);
  }

  // ── 4. Seed freelancers ────────────────────────────────────────────────────
  log.header('Step 3 — Seeding freelancers');

  const freelancers = [];
  for (const flData of freelancersData) {
    const freelancer = await User.create(flData);
    freelancers.push(freelancer);
    log.success(`Created freelancer: ${freelancer.name} — $${freelancer.hourlyRate}/hr (${freelancer.location})`);
  }

  // ── 5. Seed jobs ───────────────────────────────────────────────────────────
  log.header('Step 4 — Seeding jobs');

  // Extract client _ids in the same order as clientsData array
  const clientIds     = clients.map(c => c._id);
  const jobsData      = createJobs(clientIds);

  // Jobs do not have password hooks, so insertMany() is fine and faster
  const jobs = await Job.insertMany(jobsData);
  jobs.forEach(job => log.success(`Created job: "${job.title.substring(0, 55)}…"`));

  // ── 6. Seed applications ───────────────────────────────────────────────────
  log.header('Step 5 — Seeding applications');

  const freelancerIds    = freelancers.map(f => f._id);
  const jobIds           = jobs.map(j => j._id);
  const applicationsData = createApplications(freelancerIds, jobIds);

  const applications = await Application.insertMany(applicationsData);
  log.success(`Created ${applications.length} applications`);

  // ── 7. Summary report ──────────────────────────────────────────────────────
  log.header('Seed Complete — Summary');
  log.divider();

  console.log(`
  📊 Database populated with:
     👤  ${clients.length} clients
     🧑‍💻  ${freelancers.length} freelancers
     💼  ${jobs.length} jobs (${jobs.filter(j => j.status === 'open').length} open, ${jobs.filter(j => j.status === 'in_progress').length} in progress)
     📨  ${applications.length} applications

  🔑  All accounts use password:  Password123

  👤  Sample client logins:
     sophia@novastartups.io     (Nova Startups)
     marcus@reidgrowthco.com   (Reid Growth Co)
     priya@finledger.tech       (FinLedger)
     daniel@createstudiogh.com (Create Studio)
     elena@shopblocks.eu       (ShopBlocks)

  🧑‍💻  Sample freelancer logins:
     james@jamesokafor.dev     (Full-stack JS — $85/hr)
     amara@amaradesigns.co     (UI/UX Design — $75/hr)
     kevin@kevintrandev.com    (React Native — $65/hr)
     fatima@fatimadata.com     (Data Science — $110/hr)
     arjun@arjunops.io         (DevOps/AWS — $90/hr)
     chloe@chloewritesco.com   (Copywriting — $70/hr)
     yusuf@yusufweb3.dev       (Blockchain — $120/hr)
     nikolai@secureniko.com    (Cybersecurity — $130/hr)
  `);

  log.divider();

  // ── 8. Disconnect ──────────────────────────────────────────────────────────
  await mongoose.disconnect();
  log.success('MongoDB disconnected. Done!');
  process.exit(0);
}

// ─── Run ────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  log.error(`Seed failed: ${err.message}`);
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});