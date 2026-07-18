// middlewares/validators/validationHandler.js
const { validationResult } = require("express-validator")
const AppError = require("../../utils/AppError")

function validationHandler(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400))
        // passes to global error handler instead of inline res.json
    }
    next()
}

module.exports = validationHandler