/**
 * models/Application.js — Job Application Schema & Model
 *
 * WHAT: Represents a freelancer's application to a specific job.
 * HOW:  Compound unique index on (job, freelancer) prevents duplicate
 *       applications; status enum tracks the hiring pipeline.
 * WHY:  Keeping application logic in its own model lets us query
 *       "all applicants for a job" or "all jobs a freelancer applied to"
 *       efficiently without embedding arrays in Job or User documents.
 *
 * Fields:
 *   job           — ref to Job
 *   freelancer    — ref to User (role === 'freelancer')
 *   coverLetter   — applicant's pitch (required)
 *   proposedRate  — freelancer's rate/bid
 *   estimatedDays — estimated delivery time
 *   status        — 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn'
 *   clientNote    — client's internal note on the application
 *   timestamps    — auto-managed
 */

const mongoose = require('mongoose');

const APPLICATION_STATUSES = [
  'pending',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
];

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required'],
      index: true,
    },

    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [50, 'Cover letter must be at least 50 characters'],
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },

    proposedRate: {
      type: Number,
      required: [true, 'Proposed rate/bid is required'],
      min: [1, 'Rate must be at least $1'],
    },

    estimatedDays: {
      type: Number,
      required: [true, 'Estimated delivery time is required'],
      min: [1, 'Estimated days must be at least 1'],
      max: [365, 'Estimated days cannot exceed 365'],
    },

    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
      },
      default: 'pending',
    },

    clientNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Client note cannot exceed 500 characters'],
      default: '',
    },

    attachments: {
      type: [String], // URLs to attached files / portfolio items
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound Unique Index ───────────────────────────────────────────────────
// A freelancer can apply to any given job exactly once
applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
