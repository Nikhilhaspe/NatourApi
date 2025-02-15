// global sync. errors uncaught exceptions only
process.on('uncaughtException', (error) => {
  console.log(error);
  process.exit(1);
});

// env variable file
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

// constants
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DBPASS,
).replace('<USERNAME>', process.env.DBUSERNAME);

// mongoose
mongoose.connect(DB).then((con) => console.log('Connected to database'));

const app = require('./app');

// server startup
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on port ${process.env.PORT || 3000}`);
});

// global unhandled rejection promises (only for uncaught promises, async)
process.on('unhandledRejection', (error) => {
  console.log('Uncaught Exception Occured');
  console.log(`${error.name} ${error.message}`);

  server.close(() => {
    process.exit(1);
  });
});
