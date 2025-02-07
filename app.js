const express = require('express');
const morgan = require('morgan');
// custom modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware for all
app.use(globalErrorHandler);

module.exports = app;
