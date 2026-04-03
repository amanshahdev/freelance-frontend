/**
 * models/User.js — User Schema & Model
 *
 * WHAT: Defines the MongoDB document structure for all platform users.
 * HOW:  Mongoose schema with built-in validation, pre-save bcrypt hashing,
 *       an instance method for password comparison, and a toJSON transform
 *       that strips the password before any response is sent.
 * WHY:  Centralising user shape and password logic here guarantees that
 *       every controller that creates or queries users gets consistent
 *       behaviour without duplicating hashing/validation code.
 *
 * Fields:
 *   name        — display name (required)
 *   email       — unique login identifier (required)
 *   password    — bcrypt hash (required, never returned via toJSON)
 *   role        — 'client' | 'freelancer' (required, immutable after set)
 *   bio         — short profile description
 *   skills      — array of skill strings (relevant for freelancers)
 *   profilePic  — URL to avatar image
 *   location    — city / country string
 *   hourlyRate  — freelancer's rate in USD
 *   portfolio   — array of { title, url } objects
 *   isActive    — soft-delete / ban flag
 *   timestamps  — createdAt / updatedAt managed by Mongoose
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    url:   { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ['client', 'freelancer'],
        message: 'Role must be either "client" or "freelancer"',
      },
      required: [true, 'Role is required'],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'You cannot list more than 20 skills',
      },
    },

    profilePic: {
      type: String,
      trim: true,
      default: '',
    },

    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },

    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
      max: [10000, 'Hourly rate seems unreasonably high'],
      default: 0,
    },

    portfolio: {
      type: [portfolioItemSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Portfolio cannot have more than 10 items',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Remove __v from responses
    versionKey: false,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// Email is already indexed via `unique: true`.
// Text index on name + bio + skills for full-text user search
userSchema.index({ name: 'text', bio: 'text', skills: 'text' });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ─── Pre-save Hook: Hash password ────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash when the password field has actually changed
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12); // cost factor 12 ≈ ~300 ms
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Method: Compare Passwords ─────────────────────────────────────
/**
 * comparePassword(candidatePassword)
 * Compares a plain-text candidate against the stored bcrypt hash.
 * Returns true if they match.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── toJSON Transform: Strip sensitive fields ────────────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
