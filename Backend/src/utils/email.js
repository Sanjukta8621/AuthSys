const transporter= require("./transporter")
async function sendEmail(to, otp, username,otpExpiry) {


    try {

        const expiryTime = new Date(otpExpiry).toLocaleString("en-IN",{
        timeZone: "Asia/Kolkata"
    }
    )

        console.log("Sending email...")
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "OTP Verification",
            html: `
                <h2>Hi ${username}</h2>
                <p>Your OTP is: ${otp} Valid till ${expiryTime}.</p>
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