function sendCookie(res, token) {

    res.cookie("cookieToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    })
}

module.exports = sendCookie