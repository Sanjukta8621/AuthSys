// middlewares/validators/loginValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const loginValidator = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage("Please provide a valid email!"),

    body("password")
        .notEmpty().withMessage("Password is required!"),

    validationHandler
]

module.exports = loginValidator