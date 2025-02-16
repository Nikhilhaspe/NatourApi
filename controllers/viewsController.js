// models
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

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

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
  return;
});
