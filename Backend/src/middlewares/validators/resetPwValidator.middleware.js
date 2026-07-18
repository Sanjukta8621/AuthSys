// middlewares/validators/resetPasswordValidator.middleware.js
const { body } = require("express-validator")
const validationHandler = require("./validationHandler")

const resetPasswordValidator = [
    body("newPassword")
        .notEmpty().withMessage("New password is required!")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })
        .withMessage("Password must contain uppercase, lowercase, number and special character!"),

    body("confirmPassword")
        .notEmpty().withMessage("Confirm password is required!")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match!")
            }
            return true
        }),

    validationHandler
]

module.exports = resetPasswordValidator