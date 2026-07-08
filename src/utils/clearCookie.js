// utils/clearCookie.js — replace your existing file

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}

// clears only temp token — used in verifyOTP after session created
function clearTempCookie(res) {
    res.clearCookie("tempToken", cookieOptions)
}

// clears only refresh token — if needed individually
function clearRefreshCookie(res) {
    res.clearCookie("refreshToken", cookieOptions)
}

// clears both — used in logout
function clearAuthCookies(res) {
    clearTempCookie(res);
    clearRefreshCookie(res);
}


module.exports = {
    clearTempCookie,
    clearRefreshCookie,
    clearAuthCookies
}