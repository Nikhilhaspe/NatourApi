const bookingRouter = require('express').Router();

// controllers
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

bookingRouter.use(authController.protect);

bookingRouter.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession,
);

// for lead guides , admins only
bookingRouter.use(authController.restrictTo('admin', 'lead-guide'));

bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRouter;
