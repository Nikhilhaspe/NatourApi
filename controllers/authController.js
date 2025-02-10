const jwt = require('jsonwebtoken');
const { promisify } = require('util');
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get The Token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError('You are not logged in, Please login to get access', 401),
    );
    return;
  }

  // 2. Token Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check If User Still Exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(
      new AppError(
        'The user belonging to the token does no longer exists.',
        401,
      ),
    );
    return;
  }

  // 4. If user changed password after the jwt created
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }

  // SUCCESSFULL: Grant access to protected route
  req.user = currentUser;
  next();
});
