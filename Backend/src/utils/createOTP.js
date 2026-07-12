// src/utils/createOTP.js — production-grade version
const bcrypt = require("bcryptjs")
const crypto = require("crypto")  // built-in Node.js, no install needed

async function createOTP() {

    // Cryptographically secure random 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10)

    // Expiry — 5 minutes
    const otpExpiry = Date.now() + 5 * 60 * 1000

    return {
        otp,
        hashedOTP,
        otpExpiry
    }
}

module.exports = createOTP