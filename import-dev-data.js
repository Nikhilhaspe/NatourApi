// env variable file
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const fs = require('fs');

// model
const Tour = require(`${__dirname}/models/tourModel`);
const User = require(`${__dirname}/models/userModel`);
const Review = require(`${__dirname}/models/reviewModel`);

// constants
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DBPASS,
).replace('<USERNAME>', process.env.DBUSERNAME);

// mongoose
mongoose.connect(DB).then((con) => console.log('Connected to database'));

// tours from file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8'),
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8'),
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8'),
);

async function importData() {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data Inserted!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
}

async function deleteData() {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('Deleted Successfully!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
