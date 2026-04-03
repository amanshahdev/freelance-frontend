/**
 * models/Job.js — Job Schema & Model
 *
 * WHAT: Defines the MongoDB document structure for job postings created by clients.
 * HOW:  Schema with category enum, budget range, required skills, status lifecycle,
 *       and a virtual `applicationCount` populated when needed.
 * WHY:  All job-related business rules (valid statuses, budget constraints) live
 *       here so controllers never have to guard for them individually.
 *
 * Fields:
 *   title          — job headline
 *   description    — full job description
 *   client         — ref to User (role === 'client')
 *   category       — one of predefined categories
 *   skills         — required skill tags
 *   budgetType     — 'fixed' | 'hourly'
 *   budgetMin      — minimum budget / hourly rate
 *   budgetMax      — maximum budget / hourly rate
 *   deadline       — desired completion date
 *   status         — 'open' | 'in_progress' | 'completed' | 'cancelled'
 *   location       — 'remote' | 'onsite' | 'hybrid'
 *   experienceLevel — 'entry' | 'intermediate' | 'expert'
 *   isActive       — soft delete
 *   timestamps     — auto-managed
 */

const mongoose = require('mongoose');

const JOB_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Animation',
  'Music & Audio',
  'Data Science & Analytics',
  'Cybersecurity',
  'Cloud & DevOps',
  'Blockchain',
  'AI & Machine Learning',
  'Customer Support',
  'Business & Finance',
  'Other',
];

const JOB_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A job must be associated with a client'],
      index: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: JOB_CATEGORIES,
        message: `Category must be one of: ${JOB_CATEGORIES.join(', ')}`,
      },
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 15,
        message: 'Cannot specify more than 15 required skills',
      },
    },

    budgetType: {
      type: String,
      required: [true, 'Budget type is required'],
      enum: {
        values: ['fixed', 'hourly'],
        message: 'Budget type must be "fixed" or "hourly"',
      },
    },

    budgetMin: {
      type: Number,
      required: [true, 'Minimum budget is required'],
      min: [1, 'Budget must be at least $1'],
    },

    budgetMax: {
      type: Number,
      required: [true, 'Maximum budget is required'],
      validate: {
        validator: function (val) {
          return val >= this.budgetMin;
        },
        message: 'Maximum budget must be greater than or equal to minimum budget',
      },
    },

    deadline: {
      type: Date,
      validate: {
        validator: (val) => !val || val > new Date(),
        message: 'Deadline must be a future date',
      },
    },

    status: {
      type: String,
      enum: {
        values: JOB_STATUSES,
        message: `Status must be one of: ${JOB_STATUSES.join(', ')}`,
      },
      default: 'open',
    },

    location: {
      type: String,
      enum: {
        values: ['remote', 'onsite', 'hybrid'],
        message: 'Location must be "remote", "onsite", or "hybrid"',
      },
      default: 'remote',
    },

    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'intermediate', 'expert'],
        message: 'Experience level must be "entry", "intermediate", or "expert"',
      },
      default: 'intermediate',
    },

    attachments: {
      type: [String], // array of file URLs
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Text index for full-text search on title, description, skills
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ budgetMin: 1, budgetMax: 1 });
jobSchema.index({ isActive: 1 });

// ─── Virtual: applicationCount ───────────────────────────────────────────────
// Populated dynamically by Application model when needed
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  count: true, // returns count only
});

// ─── Static: JOB_CATEGORIES export ──────────────────────────────────────────
jobSchema.statics.getCategories = () => JOB_CATEGORIES;

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
