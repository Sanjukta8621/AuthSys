const transporter = require("./transporter")
const logger = require("./logger")

async function confimrationMail(to, username) {
    try {
        const confirm = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "Welcome to AuthSys",
            html: `<p>Hi ${username}, now you are a part of our site! Please take time to survey.</p>`
        })

        logger.info(`Confirmation email sent to ${to} — ${confirm.response}`)

    } catch (e) {
        logger.error(`Confirmation email failed for ${to}: ${e.message}`)
    }
}

module.exports = confimrationMail