const bcrypt = require("bcryptjs")

async function createOTP() {

    // Generate OTP
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString()

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10)

    // Expiry
    const otpExpiry = Date.now() + 5 * 60 * 1000

    return {

        otp,
        hashedOTP,
        otpExpiry

    }

}

module.exports = createOTP