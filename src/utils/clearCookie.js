function clearCookie(res) {
    res.clearCookie("cookieToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    })
}

module.exports = clearCookie