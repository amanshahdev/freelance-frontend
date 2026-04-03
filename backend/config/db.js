/**
 * config/db.js — MongoDB Connection
 *
 * WHAT: Establishes and manages the Mongoose connection to MongoDB Atlas (or local).
 * HOW:  Reads MONGO_URI from the environment, calls mongoose.connect() with
 *       production-safe options, and emits lifecycle events for monitoring.
 * WHY:  Isolating DB connection logic here means server.js stays clean and
 *       we can swap databases or add read replicas in one place.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      // These options ensure reliable, production-safe connections
      serverSelectionTimeoutMS: 5000,  // fail fast if Mongo is unreachable
      socketTimeoutMS: 45000,          // close idle sockets after 45 s
      family: 4,                       // force IPv4 (avoids DNS quirks)
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    // ── Connection lifecycle hooks ──────────────────────────────────────────
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄  MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err.message);
    });

    // Graceful shutdown on SIGINT / SIGTERM (Ctrl-C or container stop)
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received — closing MongoDB connection…`);
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return conn;
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    throw error; // bubble up so server.js can exit cleanly
  }
};

module.exports = connectDB;
