// middlewares/validators/verifyOTPValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const verifyOTPValidator = [
    body("otp")
        .notEmpty().withMessage("OTP is required!")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits!")
        .isNumeric().withMessage("OTP must contain numbers only!"),

    validationHandler
]

module.exports = verifyOTPValidator