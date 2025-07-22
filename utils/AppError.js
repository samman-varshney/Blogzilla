class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // call the parent (Error) constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // marks custom known errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
