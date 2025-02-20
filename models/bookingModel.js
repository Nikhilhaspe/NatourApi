const mongoose = require('mongoose');

const bookingsSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    require: [true, 'Booking must belong to a tour'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Booking must belong to a user'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// query middlewares
bookingsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate('user');
});

const Booking = mongoose.model('Booking', bookingsSchema);
module.exports = Booking;
