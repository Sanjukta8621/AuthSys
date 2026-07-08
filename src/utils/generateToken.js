const jwt = require("jsonwebtoken")

function generateTempToken(userId) {
return jwt.sign(
{id: userId,
type: "temp"},
process.env.JWT_SECRET,
{expiresIn: "10m"})
}

function generateAccessToken(userId, sessionId) {
return jwt.sign(
{id: userId,
sessionId,
type: "access"},
process.env.JWT_SECRET,
{expiresIn: "15m"}
)}

function generateRefreshToken(userId) {
return jwt.sign(
{id: userId,
type: "refresh"},
process.env.JWT_SECRET,
{expiresIn: "7d"})
}

module.exports = {
generateTempToken,
generateAccessToken,
generateRefreshToken
}
