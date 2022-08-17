const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");
const router = express.Router();

/*router.param("id", (req, res, next, val) => {
  console.log('Hello from the tour routes!');
  next();
})*/

router.route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats")
    .get(tourController.getTourStats);

router.route("/monthly-plan/:year")
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guides'),
        tourController.getMonthlyPlan);

// /tours-within?distance=233&center=-40,45&unit=miles
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

router.route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour)

router.use('/:tourId/reviews', reviewRouter)

router.route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour)

module.exports = router;