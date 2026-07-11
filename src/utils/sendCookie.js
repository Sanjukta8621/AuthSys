function sendTempCookie(res, token) {
res.cookie("tempToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 60 * 1000
})
}


function sendRefreshCookie(res, token) {
res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
})
}

module.exports = {
sendTempCookie,
sendRefreshCookie
}
