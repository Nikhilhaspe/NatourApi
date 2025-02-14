const express = require('express');
// utilites
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter
  .route('/')
  .post(authController.protect, reviewController.createReview)
  .get(authController.protect, reviewController.getAllReviews);
reviewRouter
  .route('/:reviewId')
  .get(authController.protect, reviewController.getReview);

module.exports = reviewRouter;
