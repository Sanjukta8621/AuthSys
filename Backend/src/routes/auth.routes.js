const express = require("express")
const uploadAvatar = require("../middlewares/uploadAvatar.middleware")
const authController = require("../controllers/auth.controller")
const { verifyTempToken, verifyAccessToken } = require("../middlewares/auth.middleware")
const checkLogin = require("../middlewares/checkLogin.middleware")
const otpLimiter = require("../middlewares/otpLimiter.middleware")
const registerValidator = require("../middlewares/validators/registerValidator.middleware")
const loginValidator = require("../middlewares/validators/loginValidator.middleware")
const otpLoginValidator = require("../middlewares/validators/otpLoginValidator.middleware")
const verifyOTPValidator = require("../middlewares/validators/verifyOTPValidator.middleware")
const forgotPasswordValidator = require("../middlewares/validators/forgotPasswordValidator.middleware")
const resetPasswordValidator = require("../middlewares/validators/resetPwValidator.middleware")
const { passwordLoginLimiter } = require("../middlewares/rateLimiter.middleware")





const routes = express.Router()

// ── Public ──────────────────────────────────────────────

routes.post("/register",
    uploadAvatar,
    registerValidator,
    authController.registerUser
)

routes.post("/forgot-password",
    forgotPasswordValidator,
    authController.forgotPassword
)

routes.post("/reset-password",
    verifyTempToken,
    resetPasswordValidator,
    authController.resetPassword
)

// ── OTP flow ─────────────────────────────────────────────
routes.post("/verify-otp",
    verifyTempToken,
    otpLimiter,
    verifyOTPValidator,
    authController.verifyOTP
)

routes.post("/resend-otp",
    verifyTempToken,
    otpLimiter,
    authController.resendOTP
)

// ── Login ─────────────────────────────────────────────────
routes.post("/password-login",
    passwordLoginLimiter,
    checkLogin,
    loginValidator,
    authController.login
)

routes.post("/OTP-login",
    checkLogin,
    otpLoginValidator,
    authController.loginOTP
)

// ── Token ─────────────────────────────────────────────────
routes.post("/rotate-refresh-token",
    authController.rotateRefreshToken
)

// ── Protected ─────────────────────────────────────────────
routes.get("/getMe",
    verifyAccessToken,
    authController.getMe
)

routes.post("/logOut",
    verifyAccessToken,
    authController.logout
)

routes.post("/logOut-all",
    verifyAccessToken,
    authController.logOutAll
)

module.exports = routes
