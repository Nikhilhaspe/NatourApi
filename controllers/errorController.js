const AppError = require('../utils/appError');

const handleJWTError = () =>
  new AppError('Invalid Token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token Has Expired. Please log in again', 401);

const handleValidationErrorDB = (error) => {
  const allErrorMsg = Object.values(error.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input data. ${allErrorMsg}`;

  return new AppError(message, 400);
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value} Please use another value`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // for api
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error,
    });
  }

  // for view
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong',
    msg: error.message,
  });
};

const sendErrorProd = (error, req, res) => {
  // A. APIs
  if (req.originalUrl.startsWith('/api')) {
    // Trusted Error For API
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    // Generic Error, do not send extra info to the client
    return res
      .status(500)
      .json({ status: 'error', message: 'Something went wrong!' });
  }

  // B. VIEWS
  // Trusted Error For Views
  if (error.isOperational) {
    return res.status(error.statusCode).render('error', { msg: error.message });
  }
  // Generic Error, do not send extra info to the client
  return res.status(500).render('error', { msg: 'Please Try Again!' });
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errorCopy = { ...error };
    errorCopy.message = error.message;

    if (error.name === 'CastError') {
      errorCopy = handleCastErrorDB(errorCopy);
    }

    if (error.code === 11000) {
      errorCopy = handleDuplicateFieldsDB(errorCopy);
    }

    if (error.name === 'ValidationError') {
      errorCopy = handleValidationErrorDB(errorCopy);
    }

    if (error.name === 'JsonWebTokenError') {
      errorCopy = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      errorCopy = handleJWTExpiredError();
    }

    sendErrorProd(errorCopy, req, res);
  }

  return;
};
