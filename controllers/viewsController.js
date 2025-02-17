// models
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
// utilities
const AppError = require('./../utils/appError');

exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
  return;
});

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. get tour data from the collection
  const tours = await Tour.find();

  // 2. build template

  // 3. render template using data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
  return;
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // if (!tour) {
  //   next(new AppError('There is no tour with that name', 404));
  //   return;
  // }

  return res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
