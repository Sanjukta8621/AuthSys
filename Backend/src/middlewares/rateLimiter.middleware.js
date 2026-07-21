// src/middlewares/rateLimiter.middleware.js
const rateLimit = require("express-rate-limit")

// ── Global limiter — all routes ──────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 100,                     // 100 requests per window per IP
    standardHeaders: true,        // sends RateLimit headers in response
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    }
})

// ── Auth limiter — all auth routes ───────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,                      // 20 auth attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many auth attempts. Please try again after 15 minutes."
    }
})

// ── Password login limiter — strictest ───────────────────
const passwordLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                       // only 5 attempts per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
})

module.exports = {
    globalLimiter,
    authLimiter,
    passwordLoginLimiter
}