const express = require("express")
const authController =require("../controllers/auth.controller")
const verifyToken = require("../middlewares/auth.middleware")
const registerValidator = require("../middlewares/validators/registerValidator")


const routes = express.Router()


routes.post(
    "/register",
    registerValidator,
    authController.registerUser
)

routes.post(
    "/verify-otp",
    verifyToken,
    authController.verifyOTP
)

routes.post(
    "/resend-otp",
    authController.resendOTP
)

routes.post(
    "/password-login",
    authController.login
)

routes.post(
    "/OTP-login",
    authController.loginOTP
)

routes.post(
    "/logout", 
    verifyToken,
    authController.logout
)
routes.post(
    "/forgot-password",
    authController.forgotPassword
)
routes.post(
    "/reset-password",
    authController.resetPassword
)

module.exports = routes