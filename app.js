const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
// custom modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
// controllers
const bookingController = require('./controllers/bookingController');
// utility modules
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// proxy
app.enable('trust proxy');

// CORS
app.use(cors());
app.options('*', cors());

// setup view engine
app.set('view engine', 'pug');
// views location
app.set('views', path.join(__dirname, 'views'));

// static files middleware
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// global middlewares
// secure headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
// rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter);
// logging middleware (for only development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// stripe web hook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// body parser middleware (APIs)
app.use(express.json({ limit: '10kb' }));
// body parser middleware (frontend form data)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// cookie parser middleware
app.use(cookieParser());
// data sanitization against nosql query injection
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());
// parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// test middleware
// app.use((req, res, next) => {
//   next();
// });

// compression
app.use(compression());

// routes
// VIEWS
app.use('/', viewRouter);
// API
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// un-matched routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handling middleware for all
app.use(globalErrorHandler);

module.exports = app;
