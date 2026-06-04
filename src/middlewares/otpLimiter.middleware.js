const checkTempBlock = require("../utils/checkTempBlock")

async function otpLimiter(req,res,next) {

try{  

    const user= req.user

        const blockStatus = await checkTempBlock(req.user)

        if (blockStatus.blocked) {
            return res.status(429).json({
                code: "TEMP_BLOCKED",
                message: blockStatus.message
            })
        }

        if (blockStatus.expired) {
            req.user.temporaryLockUntil = null
            req.user.wrongOtpAttempt = 0
            await req.user.save()
        }
    next()
}
    

    catch(error) {
        return res.status(401).json({ message: error.message })
    }

}


module.exports= otpLimiter