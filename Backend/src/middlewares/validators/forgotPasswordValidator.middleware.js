// middlewares/validators/forgotPasswordValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const forgotPasswordValidator = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage("Please provide a valid email!"),

    validationHandler
]

module.exports = forgotPasswordValidator