const jwt = require('jsonwebtoken');
// models
const User = require('./../models/userModel');
// utilities
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// helper functions
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', token, data: { user: newUser } });

  return;
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email and password', 400));
    return;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Incorrect email or password', 401));
    return;
  }

  const token = signToken(user._id);

  res.status(200).json({ status: 'success', token });
  return;
});
