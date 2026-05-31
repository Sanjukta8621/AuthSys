const bcrypt = require("bcryptjs")

async function otpVerification(user, enteredOTP) {

    // Check user
    if (!user) {

        return {
            success: false,
            message: "User not found!"
        }

    }
//null guard??
     if (!user.otp) {
        return { success: false, message: "No OTP found. Please request a new one." }
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

module.exports = otpVerification