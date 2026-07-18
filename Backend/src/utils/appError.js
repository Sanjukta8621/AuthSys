// utils/AppError.js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode

        // operational = expected error (wrong password, not found etc)
        // non-operational = programmer error (undefined variable, DB crash etc)
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError