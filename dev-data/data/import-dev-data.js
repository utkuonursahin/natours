const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const DB_STRING = process.env.DATABASE.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(DB_STRING).then(() => console.log('DB connection successful!'))

//READ JSON FILE
const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const users = fs.readFileSync(`${__dirname}/users.json`, 'utf-8');
const reviews = fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8');
//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    await User.create(JSON.parse(users), {validateBeforeSave: false});
    await Review.create(JSON.parse(reviews));
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
}
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);