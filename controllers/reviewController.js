// utilities
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
// models
const Review = require('./../models/reviewModel');

// controllers
exports.createReview = catchAsync(async (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user: req.body.user,
    tour: req.body.tour,
  });

  res.status(201).json({ status: 'success', data: { review: newReview } });
  return;
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404).json({ status: 'fail', message: 'Invalid review id!' });
    return;
  }

  res.status(200).json({ status: 'success', data: { review } });
  return;
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res
    .status(200)
    .json({ status: 'success', results: reviews.length, data: { reviews } });
  return;
});
