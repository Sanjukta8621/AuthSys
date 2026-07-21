const catchAsync = require("../utils/catchAsync")

const verifyTempToken = catchAsync(async (req, res, next) => {

    const token = req.cookies.tempToken
    if (!token) return next(new AppError("Unauthorized!", 401))

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Session expired. Please request a new OTP.", 401))
        }
        return next(new AppError("Invalid token!", 401))
    }

    if (decoded.type !== "temp") return next(new AppError("Invalid token type!", 401))

    const user = await userModel.findById(decoded.id)
    if (!user) return next(new AppError("User not found!", 401))

    const blockStatus = await checkTempBlock(user)

    if (blockStatus.blocked) {
        logger.warn(`Blocked user attempted OTP route — userId: ${user._id}`)
        return next(new AppError(blockStatus.message, 429))
    }

    if (blockStatus.expired) {
        user.temporaryLockUntil = null
        user.wrongOtpAttempt = 0
        await user.save()
    }

    req.user = user
    next()
})


const verifyAccessToken = catchAsync(async (req, res, next) => {

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError("Unauthorized!", 401))
    }

    const token = authHeader.split(" ")[1]

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Access token expired. Please refresh.", 401))
        }
        return next(new AppError("Invalid token!", 401))
    }

    if (decoded.type !== "access") return next(new AppError("Invalid token type!", 401))

    const session = await sessionModel.findOne({
        _id: decoded.sessionId,
        user: decoded.id,
        revoked: false
    })

    if (!session) {
        logger.warn(`Revoked or invalid session — userId: ${decoded.id}`)
        return next(new AppError("Session expired or revoked!", 401))
    }

    const user = await userModel.findById(decoded.id)
    if (!user) return next(new AppError("User not found!", 401))

    if (user.temporaryLockUntil && new Date() < user.temporaryLockUntil) {
        const minutesLeft = Math.ceil((user.temporaryLockUntil - new Date()) / 60000)
        logger.warn(`Blocked user hit protected route — userId: ${user._id}`)
        return next(new AppError(
            `Account blocked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
            429
        ))
    }

    req.user = user
    req.session = session
    next()
})

module.exports = { verifyTempToken, verifyAccessToken }