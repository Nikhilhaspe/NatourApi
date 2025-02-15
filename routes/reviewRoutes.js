const express = require('express');
// utilites
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

// protect all routes
reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  )
  .get(authController.protect, reviewController.getAllReviews);

reviewRouter
  .route('/:id')
  .get(authController.protect, reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = reviewRouter;
