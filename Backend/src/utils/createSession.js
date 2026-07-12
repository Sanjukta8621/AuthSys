const mongoose = require("mongoose");
const { generateRefreshToken, generateAccessToken } = require("./generateToken");
const crypto = require("crypto");
const sessionModel = require("../models/session.model");
const { sendTempCookie, sendRefreshCookie } = require("../utils/sendCookie")




async function createSession(user,req,res) {
    
    //generate refresh token
    const refreshToken= generateRefreshToken(user._id)

    //hash it before storing
    const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex")

    //create session in db
    const session = await sessionModel.create({
        user:user._id,
        refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]
    })

    //generate access token
    const accessToken = generateAccessToken (user._id, session._id)

    //send refresh in cookie
    sendRefreshCookie(res, refreshToken)

    //return access & session
    return { accessToken, session }

}


module.exports = createSession