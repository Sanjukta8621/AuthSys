async function checkTempBlock(user) {

    // 30-min temp block
    if (user.temporaryLockUntil && new Date() < user.temporaryLockUntil) {
        const minutesLeft = Math.ceil((user.temporaryLockUntil - new Date()) / 60000)
        return {
            blocked: true,
            code: "TEMP_BLOCKED",
            message: `Account blocked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`
        }
    }

    // Block expired — clear it
    if (user.temporaryLockUntil && new Date() >= user.temporaryLockUntil) {
        return { 
            blocked: false, 
            expired: true 
        }
    }

    // No block
    return { blocked: false, expired: false }
}

module.exports = checkTempBlock