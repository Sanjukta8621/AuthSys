// middlewares/validators/registerValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const registerValidator = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required!")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters!"),

    body("email")
        .trim()
        .normalizeEmail()
        .isEmail().withMessage("Please provide a valid email!"),

    body("password")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password must contain uppercase, lowercase, number and special character!"),

    validationHandler
]

module.exports = registerValidator