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
app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on port ${process.env.PORT || 3000}`);
});
