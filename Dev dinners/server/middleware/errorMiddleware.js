/**
 * Centralized Error Handling Middleware
 * Converts uncaught controller exceptions and Mongoose validation errors
 * into clean JSON error envelopes.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Error Handler] ${err.stack || err.message}`);

  // Mongoose bad ObjectId format
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, error: message });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, error: message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error. Please try again later.',
  });
};

module.exports = errorHandler;

