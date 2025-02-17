const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
// models
const User = require('./../models/userModel');
// utilities
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// helper functions
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendtoken = (res, user, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // remove password from o/p
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendtoken(res, newUser, 201);
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

  createSendtoken(res, user, 200);
  return;
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// for API
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

// for RENDERING
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1. Token Verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2. Check If User Still Exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        next();
        return;
      }

      // 3. If user changed password after the jwt created
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        next();
        return;
      }

      // there is a logged in user
      res.locals.user = currentUser;
      next();
      return;
    }
  } catch (error) {
    next();
    return;
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user by the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('There is no user with the email address', 404));
    return;
  }

  // 2. generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send it to users email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    next(
      new AppError('There was an error sending email. Try again later!', 500),
    );
    return;
  }

  res.status(200).json({ status: 'success', message: 'Token sent to email!' });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    next(new AppError('Token is invalid or has expired', 400));
    return;
  }

  // 2. set password if token not expired and user exists
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4. log the user in, send JWT
  createSendtoken(res, user, 200);
  return;
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user
  const user = await User.findById(req.body.id).select('+password');

  if (!user) {
    next(new AppError('User not found!', 404));
    return;
  }

  // 2. check is pass correct
  const isPasswordValid = await user.correctPassword(
    req.body.currentPassword,
    user.password,
  );
  if (!isPasswordValid) {
    next(new AppError('Invalid current password!', 401));
    return;
  }

  // 3. if so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  user.save();

  // 4. log the user in, send JWT
  createSendtoken(res, user, 200);
  return;
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};
