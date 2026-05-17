const bcrypt = require("bcryptjs")

async function verifyOTP(user, enteredOTP) {

    // Check user
    if (!user) {

        return {
            success: false,
            message: "User not found!"
        }

    }

    // Check expiry
    if (user.otpExpiry < Date.now()) {

        return {
            success: false,
            message: "OTP expired!"
        }

    }

    // Compare OTP
    const isOTPValid = await bcrypt.compare(
        enteredOTP,
        user.otp
    )

    if (!isOTPValid) {

        return {
            success: false,
            message: "Invalid OTP!"
        }

    }

    return {
        success: true
    }

}

module.exports = verifyOTP