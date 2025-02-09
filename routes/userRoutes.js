const userRouter = require('express').Router();

// controllers
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// routes
userRouter
  .post('/signup', authController.signup)
  .post('/login', authController.login);

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
