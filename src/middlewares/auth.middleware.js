// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const sessionModel = require("../models/session.model")
const checkTempBlock = require("../utils/checkTempBlock")


// ── For OTP routes — reads tempToken cookie ──
async function verifyTempToken(req, res, next) {

    console.log("=========== VERIFY TEMP TOKEN ===========");
    console.log("Cookies:", req.cookies);
    console.log("Header Cookie:", req.headers.cookie);
    try {
        const token = req.cookies.tempToken

        if (!token) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.type !== "temp") {
            return res.status(401).json({ message: "Invalid token type!" })
        }

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "User not found!" })
        }

        
        checkTempBlock(user)

        req.user = user
        next()

    } catch (error) {
        return res.status(401).json({ message: error.message })
    }
}






// ── For protected routes — reads Authorization Bearer header ──
async function verifyAccessToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized!" })
        }

        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.type !== "access") {
            return res.status(401).json({ message: "Invalid token type!" })
        }

        // verify session is still valid and not revoked
        const session = await sessionModel.findOne({
            _id: decoded.sessionId,
            user: decoded.id,
            revoked: false
        })

        if (!session) {
            return res.status(401).json({ message: "Session expired or revoked!" })
        }

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "User not found!" })
        }

        req.user = user
        req.session = session
        next()

    } catch (error) {
        return res.status(401).json({ message: error.message })
    }
}

module.exports = { verifyTempToken, verifyAccessToken }