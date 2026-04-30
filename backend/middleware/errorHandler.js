const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message, err.stack?.split('\n')[1]?.trim());
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const label = field === 'username' ? 'Employee ID' : field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({ message: `${label} already exists` });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
