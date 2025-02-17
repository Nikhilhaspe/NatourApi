const express = require('express');
// controllers
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/login', authController.isLoggedIn, viewController.login);

viewRouter.get('/', authController.isLoggedIn, viewController.getOverview);

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
