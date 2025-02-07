// env variable file
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const fs = require('fs');

// model
const Tour = require(`${__dirname}/models/tourModel`);

// constants
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DBPASS,
).replace('<USERNAME>', process.env.DBUSERNAME);

// mongoose
mongoose.connect(DB).then((con) => console.log('Connected to database'));

// tours from file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'),
);

async function importData() {
  try {
    await Tour.create(tours);
    console.log('Data Inserted!');
  } catch (error) {
    console.log(error);
  }

  process.exit();
}

async function deleteData() {
  try {
    await Tour.deleteMany({});
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
