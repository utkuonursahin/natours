const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours
  })
})
exports.getTour = catchAsync(async (req, res, next) => {
  // get data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({slug: req.params.slug}).populate({'path': 'reviews', select: 'review rating user'});
  if (!tour) return next(new AppError('There is no tour with that name.', 404))
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour
  })
})

exports.getLoginForm = async (req, res) => {
  res.status(200).render('login', {title: 'Log into your account'})
}

exports.getAccount = (req, res) => {
  res.status(200).render('account', {title: 'Your profile'})
}

exports.getMyTours = catchAsync(async (req, res) => {
  // const bookings = await Booking.find({user: req.user.id});
  // const tourIDs = bookings.map(el => el.tour);
  // const tours = await Tour.find({_id: {$in: tourIDs}})
  // res.status(200).render('overview', {title: 'My tours', tours})
  const user = await User.findById(req.user.id).populate({path: 'bookings'})
  const tourIDs = user.bookings.map(el => el.tour.id);
  const tours = await Tour.find({_id: {$in: tourIDs}})
  res.status(200).render('overview', {title: 'My tours', tours})
})