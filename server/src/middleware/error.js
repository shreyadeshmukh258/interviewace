export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
  }
  if (err.name === 'ValidationError') status = 422;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use';
  }
  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Something went wrong on our side';
  }
  res.status(status).json({ success: false, message, details: err.details });
};
