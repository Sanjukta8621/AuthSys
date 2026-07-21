// middlewares/errorHandler.middleware.js
const AppError = require("../utils/AppError")
const logger = require("../utils/logger")


// Handle specific known error types from MongoDB and JWT
function handleCastError(err) {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400)
}

function handleDuplicateKeyError(err) {
    const field = Object.keys(err.keyValue)[0]
    return new AppError(`${field} already exists. Please use a different value.`, 409)
}

function handleValidationError(err) {
    const errors = Object.values(err.errors).map(e => e.message)
    return new AppError(errors[0], 400)
}

function handleJWTError() {
    return new AppError("Invalid token. Please login again.", 401)
}

function handleJWTExpiredError() {
    return new AppError("Token expired. Please login again.", 401)
}

// Main error handler — 4 args, Express knows this is an error middleware
function errorHandler(err, req, res, next) {

    err.statusCode = err.statusCode || 500

    // ── convert known error types to AppError ──
    let error = { ...err, message: err.message }

    if (err.name === "CastError") error = handleCastError(err)
    if (err.code === 11000) error = handleDuplicateKeyError(err)
    if (err.name === "ValidationError") error = handleValidationError(err)
    if (err.name === "JsonWebTokenError") error = handleJWTError()
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError()

    // ── operational error: send to client ──
    if (error.isOperational) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        })
    }

    // ── programmer error: don't leak details ──
    logger.error(`PROGRAMMER ERROR: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    })
    
    return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later."
    })
}

module.exports = errorHandler