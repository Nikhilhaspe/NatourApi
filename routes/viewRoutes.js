const express = require('express');
// controllers
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const viewRouter = express.Router();

viewRouter.get('/login', viewController.login);

viewRouter.get('/', viewController.getOverview);

viewRouter.get('/tour/:slug', authController.protect, viewController.getTour);

module.exports = viewRouter;
