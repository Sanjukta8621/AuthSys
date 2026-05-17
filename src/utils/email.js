const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
})

async function sendEmail(to, otp, username) {

    try {

        console.log("Sending email...")
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "OTP Verification",
            html: `
                <h2>Hi ${username}</h2>
                <p>Your OTP is: ${otp} Valid for 5 minutes.</p>
            `
        })
        console.log(to)
        console.log("Email sent successfully!")
        console.log(info.response)
    }

    catch (err) {
        console.log("EMAIL ERROR:")
        console.log(err)
    }
}

module.exports = sendEmail