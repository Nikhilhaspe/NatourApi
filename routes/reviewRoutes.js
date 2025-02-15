const express = require('express');
// utilites
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/')
  .post(
    authController.protect,
    reviewController.setTourUserIds,
    reviewController.createReview,
  )
  .get(authController.protect, reviewController.getAllReviews);

reviewRouter
  .route('/:id')
  .get(authController.protect, reviewController.getReview)
  .patch(authController.protect, reviewController.updateReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = reviewRouter;
