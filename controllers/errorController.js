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

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error: error,
  });
};

const sendErrorProd = (error, res) => {
  // Trusted Error
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Generic Error, do not send extra info to the client
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errorCopy = { ...error };

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

    sendErrorProd(errorCopy, res);
  }

  return;
};
