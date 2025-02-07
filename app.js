const express = require('express');
const morgan = require('morgan');
// custom modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// middlewares
// logging middleware (for only development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// body parser middleware
app.use(express.json());
// static files middleware
app.use(express.static(`${__dirname}/public`));

// routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// un-matched routes
app.all('*', (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 'fail';
  error.statusCode = 404;

  next(error);
});

// global error handling middleware for all
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res
    .status(error.statusCode)
    .json({ status: error.status, message: error.message });

  return;
});

module.exports = app;
