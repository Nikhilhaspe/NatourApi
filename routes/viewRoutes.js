const express = require('express');
// controllers
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const viewRouter = express.Router();

// protect all below routes
viewRouter.use(authController.isLoggedIn);

viewRouter.get('/login', viewController.login);

viewRouter.get('/', viewController.getOverview);

viewRouter.get('/tour/:slug', viewController.getTour);

module.exports = viewRouter;
