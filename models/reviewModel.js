const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to an user']
  }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}})

reviewSchema.statics.calcAvgRatings = async function (tourId) {
  //this points to current Model
  const stats = await this.aggregate([
    {$match: {tour: tourId}},
    {
      $group: {
        _id: '$tour',
        nRating: {$sum: 1},
        avgRating: {$avg: '$rating'}
      }
    }
  ])
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
  }
}

reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.pre(/^find/, function (next) {
  this.populate({path: 'user', select: 'name photo'});
  next();
})

reviewSchema.post('save', function () {
  //this points to the current document
  this.constructor.calcAvgRatings(this.tour);
})

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.calcAvgRatings(doc.tour);
  next();
});

/*reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
})
reviewSchema.post(/^findOneAnd/, async function () {
  //await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAvgRatings(this.r.tour)
})*/

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;