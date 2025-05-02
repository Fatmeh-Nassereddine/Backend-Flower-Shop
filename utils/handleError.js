// utils/handleError.js
function handleError(res, error, customMessage = 'Internal Server Error', statusCode = 500) {
    console.error('❌', error);
    res.status(statusCode).json({
      message: customMessage,
      error: error.message || error,
      data: null,
    });
  }
  
  module.exports = handleError;
  