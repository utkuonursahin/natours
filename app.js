const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const bookingController = require('./controllers/bookingController')
const viewRouter = require('./routes/viewRoutes')

const limiter = rateLimit({
  max: 50, // 50req/hr
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

const app = express();
app.enable('trust proxy');
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// Global Middlewares
//Implement CORS
// app.use(cors())
// app.options('*', cors())
//Serving static files
app.use(express.static(path.join(__dirname, 'public')));
//Set security HTTP headers { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }
app.use(helmet({crossOriginEmbedderPolicy: false}));
//Set Content Security Header
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "worker-src 'self' blob:; script-src 'self' https://api.mapbox.com/ https://cdnjs.cloudflare.com/ https://js.stripe.com/v3/;");
  return next();
})
//Limit requests from same IP
app.use('/api', limiter);
//Stripe webhook
app.post('/webhook-checkout', express.raw({type: 'application/json'}), bookingController.webhookCheckout);
//Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));
app.use(cookieParser())
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());
//Prevent parameter pollution
app.use(hpp({whitelist: ['duration', 'rate', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']}));
//Compress text responses
app.use(compression())
//Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)))
//Global error handling
app.use(globalErrorController);

module.exports = app;