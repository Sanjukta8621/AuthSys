const express = require("express")
const authController =require("../controllers/auth.controller")
const verifyToken = require("../middlewares/auth.middleware")
const registerValidator = require("../middlewares/validators/registerValidator.middleware")
const checkLogin = require("../middlewares/checkLogin.middleware")
const otpLimiter = require("../middlewares/otpLimiter.middleware")


const routes = express.Router()


routes.post(
    "/register",
    registerValidator,
    authController.registerUser
)

routes.post(
    "/verify-otp",
    verifyToken,
    otpLimiter,
    authController.verifyOTP
)

routes.post(
    "/resend-otp",
    verifyToken,
    otpLimiter,
    authController.resendOTP
)

routes.post(
    "/password-login",
    checkLogin,
    authController.login
)

routes.post(
    "/OTP-login",
    checkLogin,
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