const transporter = require("./transporter")
const logger = require("./logger")

async function sendEmail(to, otp, username, otpExpiry) {
    try {

        const expiryTime = new Date(otpExpiry).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata"
        })

        logger.info(`Sending OTP email to ${to}`)

        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "OTP Verification",
            html: `
                <h2>Hi ${username}</h2>
                <p>Your OTP is: ${otp} Valid till ${expiryTime}.</p>
            `
        })

        logger.info(`OTP email sent successfully to ${to} — ${info.response}`)

    } catch (err) {
       // logger.error(`OTP email failed for ${to}: ${err.message}`)
       logger.error(err)
    }
}

module.exports = sendEmail