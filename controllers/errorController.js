const AppError = require('../utils/appError');
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) { //API
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else { //RENDERED WEBSITE
    console.error(`ERROR!! ${err}`);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    })
  }
}

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) { //API
    if (err.isOperational) {  //Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    } else {
      //Programming or other unknown error: don't leak error details
      console.error(`ERROR!! ${err}`); //1) Log error
      return res.status(500).json({ //2) Send generic message
        status: 'error',
        message: 'Something went wrong'
      })
    }
  }
  //RENDERED WEBSITE
  if (err.isOperational) {  //Operational, trusted error: send message to client
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    })
  } else {
    //Programming or other unknown error: don't leak error details
    console.error(`ERROR!! ${err}`); //1) Log error
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later'
    })
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value`;
  return new AppError(message, 400);
}
const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors).map(val => val.message).join('. ');
  return new AppError(message, 400);
}
const handleJWTError = () => new AppError("Invalid token. Please log in again", 401);
const handleJWTExpiredError = () => new AppError("Your token has expired. Please log in again", 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else {
    let error = { ...err, name: err.name, message: err.message };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    else if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    else if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    else if (error.name === 'JsonWebTokenError') error = handleJWTError();
    else if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
}