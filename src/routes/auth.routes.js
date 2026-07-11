const express = require("express")
const authController =require("../controllers/auth.controller")
const {verifyTempToken,verifyAccessToken} = require("../middlewares/auth.middleware")
const registerValidator = require("../middlewares/validators/registerValidator.middleware")
const resetPasswordValidator = require ("../middlewares/validators/resetPwValidator.middleware")
const checkLogin = require("../middlewares/checkLogin.middleware")
const otpLimiter = require("../middlewares/otpLimiter.middleware")


const routes = express.Router()

//resgister
routes.post(
    "/register",
    registerValidator,
    authController.registerUser
)


//verifyOTP
routes.post(
    "/verify-otp",
    verifyTempToken,
    otpLimiter,
    authController.verifyOTP
)


//resendOTP
routes.post(
    "/resend-otp",
    verifyTempToken,
    otpLimiter,
    authController.resendOTP
)


//pwLogin
routes.post(
    "/password-login",
    checkLogin,
    authController.login
)


//OTP login
routes.post(
    "/OTP-login",
    checkLogin,
    authController.loginOTP
)

//GetMe
routes.get(
    "/getMe",
    verifyAccessToken,
    authController.getMe
)

//forgotpw
routes.post(
    "/forgot-password",
    authController.forgotPassword
)

//resetPw
routes.post(
    "/reset-password",
    verifyTempToken,
    resetPasswordValidator,
    authController.resetPassword
)


//token renewal endpoint
routes.post(
    "/rotate-refresh-token", 
    authController.rotateRefreshToken
)

//logOut 
routes.post(
    "/logOut", 
    verifyAccessToken,
    authController.logout
)

//logout-all
routes.post(
    "/logOut-all", 
    verifyAccessToken,
    authController.logOutAll
)

module.exports = routes