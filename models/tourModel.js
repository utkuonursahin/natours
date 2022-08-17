const mongoose = require('mongoose');
// const User = require('../models/userModel');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    //only for strings
    enum: {values: ['easy', 'medium', 'difficult'], message: 'Difficulty is either: easy, medium or difficult'},
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a imageCover'],
  },
  images: [String],
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maxGroupSize'],
  },
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true, //technically not a validator
    trim: true,
    //only for strings
    maxlength: [40, 'A tour name must have less than 40 characters'],
    minLength: [10, 'A tour name must have more than 10 characters']
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        //this is the current document on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be less than the original price'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    //min and max will be work with dates too
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: val => Math.round(val * 10) / 10 //4.666 => 46.666 => 47 => 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  startDates: [Date],
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary']
  },
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }
  ],
  slug: String,
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}});

// tourSchema.index({price: 1}) //single field index, ascending
tourSchema.index({price: 1, ratingsAverage: -1}) //compound index
tourSchema.index({slug: 1})
tourSchema.index({startLocation: '2dsphere'})

/*tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})*/

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  //console.log(this) //this is the document that is being saved
  this.slug = slugify(this.name, {lower: true});
  // tourSchema.virtual('slug').get(function () {
  //   return this.slug;
  // }.bind(this));
  next();
});
//
// //Runs after all pre document middleware functions worked
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE: runs before any new query is executed
//runs before all find() methods
tourSchema.pre(/^find/, function (next) {
  this.find({secretTour: {$ne: true}}); //this is the query object
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({path: 'guides', select: '-__v -passwordChangedAt'});
  next()
})

//Runs after query has already executed
// tourSchema.post(/^find/, function(docs, next) {
//   console.log(docs);
//   next();
// });

//AGGREGATION MIDDLEWARE: runs before .aggregate()
// tourSchema.pre('aggregate', function(next) {
//   //this is the current aggregation object
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//EMBEDDED DOCUMENTS
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises)
//   next();
// })

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;