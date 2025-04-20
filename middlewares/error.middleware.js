// // middlewares/error.middleware.js
// const errorMiddleware = (err, req, res, next) => {
//     console.error(err);
//     res.status(err.status || 500).json({
//       message: err.message || 'Internal Server Error',
//       error: err,
//     });
//   };
  
//   module.exports = errorMiddleware;
  

// middlewares/error.middleware.js
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Don't expose stack trace or full error object in production
    ...(process.env.NODE_ENV !== 'production' && { error: err }),
  });
};

module.exports = errorMiddleware;
