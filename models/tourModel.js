const mongoose = require('mongoose');
const slugify = require('slugify');
// models
const User = require('./userModel');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less than or equals 40 characters'],
      minlength: [10, 'A tour name must be more or equal to 10 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        message: 'Difficulty is either easy, medium or difficult',
        values: ['easy', 'medium', 'difficult'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message:
          'Discount price ({VALUE}) should be less than the regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // embedding location document
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // referencing
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // embedding tour guide (user) document
    // guides: Array,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// document middleware (before create & save)
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// document middleware (after create & save)
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// query middleware
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Time Elapsed: ${Date.now() - this.start}`);
  next();
});

// aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

// adding virtual props
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
