// models
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
// utilities
const catchAsync = require('./../utils/catchAsync');
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

  if (!tour) {
    next(new AppError('There is no tour with that name', 404));
    return;
  }

  return res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  console.log(bookings);
  console.log(tourIds);
  console.log(tours);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
