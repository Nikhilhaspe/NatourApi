const express = require('express');
// controllers
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const viewRouter = express.Router();

viewRouter.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);

// viewRouter.get('/', authController.isLoggedIn, viewController.getOverview);

viewRouter.get('/login', authController.isLoggedIn, viewController.login);

viewRouter.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewController.getTour,
);

viewRouter.get('/me', authController.protect, viewController.getAccount);

viewRouter.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData,
);

module.exports = viewRouter;
