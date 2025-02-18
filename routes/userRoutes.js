const userRouter = require('express').Router();

// controllers
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// routes
// public without auth
userRouter
  .post('/signup', authController.signup)
  .post('/login', authController.login)
  .get('/logout', authController.logout)
  .post('/forgotPassword', authController.forgotPassword)
  .patch('/resetPassword/:token', authController.resetPassword);

// protect all the routes from this point
userRouter.use(authController.protect);

userRouter.route('/updatePassword').patch(authController.updatePassword);
userRouter.get('/me', userController.getMe, userController.getUser);
userRouter
  .route('/updateMe')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe,
  );
userRouter.route('/deleteMe').delete(userController.deleteMe);

// protect all the routes from this point to admins only
userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
