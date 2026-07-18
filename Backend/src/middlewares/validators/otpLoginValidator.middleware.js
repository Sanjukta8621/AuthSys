// middlewares/validators/otpLoginValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const otpLoginValidator = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage("Please provide a valid email!"),

    validationHandler
]

module.exports = otpLoginValidator