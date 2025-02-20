const bookingRouter = require('express').Router();

const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

bookingRouter.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = bookingRouter;
