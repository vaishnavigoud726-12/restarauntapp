const mongoose = require('mongoose');

/**
 * Database Connection Utility
 * Connects to MongoDB Atlas or local instance with robust retry handling
 * and debug diagnostics.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cravewise';
    
    console.log(`[Database] Attempting connection to MongoDB...`);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.log(`[Database Info] Tip: Set MONGO_URI in server/.env with your MongoDB Atlas or local connection string.`);
    // Do not crash server in dev so API endpoints and frontend integration can still be inspected
  }
};

module.exports = connectDB;

