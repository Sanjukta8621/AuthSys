const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const createOTP = require("../utils/createOTP")
const sendEmail = require("../utils/email")
const otpVerification = require("../utils/otpVerification")
const confimrationMail= require("../utils/confirmationMail")
const { generateTempToken, generateAccessToken, generateRefreshToken } = require("../utils/generateToken")
const { sendTempCookie, sendRefreshCookie } = require("../utils/sendCookie")
const { clearTempCookie, clearRefreshCookie, clearAuthCookies } = require("../utils/clearCookie")
const checkTempBlock = require("../utils/checkTempBlock")
const bcrypt= require("bcryptjs")
const createSession = require("../utils/createSession")
const sessionModel = require("../models/session.model")
const crypto = require("crypto")



/////////////////// REGISTER USER ///////////////////
async function registerUser(req, res) {
    try {

        const { username, email, password } = req.body

        const existingUser = await userModel.findOne({ email })

        // Already verified — permanent rejection
        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({
                message: "Email already registered!"
            })
        }

        const { otp, hashedOTP, otpExpiry } = await createOTP()
        const hashedPassword = await bcrypt.hash(password, 10)

        let user
        const isReturningUser = !!(existingUser && !existingUser.isVerified)

        if (isReturningUser) {

            // Unverified ghost user — overwrite and resend
            existingUser.username = username
            existingUser.password = hashedPassword
            existingUser.otp = hashedOTP
            existingUser.otpExpiry = otpExpiry
            existingUser.otpType = "register"
            existingUser.wrongOtpAttempt = 0
            existingUser.otpResendCount = 0
            existingUser.temporaryLockUntil = null

            await existingUser.save()
            user = existingUser

        } else {

            // Brand new user
            user = await userModel.create({
                username,
                email,
                password: hashedPassword,
                isVerified: false,
                otp: hashedOTP,
                otpExpiry,
                otpType: "register"
            })

        }

        await sendEmail(user.email, otp, user.username, otpExpiry)

        // temp token — only for OTP verification step
        const tempToken = generateTempToken(user._id)
        sendTempCookie(res, tempToken)

        return res.status(201).json({
            message: isReturningUser
                ? "Account pending verification. New OTP sent."
                : "OTP sent successfully!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified
            }
        })

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

/////////////////// VERIFY OTP ///////////////////
async function verifyOTP(req, res) {
    try {

        const { otp } = req.body
        const user = req.user

        const otpResult = await otpVerification(user, otp)

        if (!otpResult.success) {

            user.wrongOtpAttempt = (user.wrongOtpAttempt || 0) + 1

            if (user.wrongOtpAttempt >= 3) {
                user.temporaryLockUntil = new Date(Date.now() + 30 * 60 * 1000)
                user.wrongOtpAttempt = 0
                await user.save()

                return res.status(429).json({
                    code: "TEMP_BLOCKED",
                    message: "Too many wrong attempts. Account blocked for 30 minutes."
                })
            }

            await user.save()

            const attemptsLeft = 3 - user.wrongOtpAttempt
            return res.status(400).json({
                message: otpResult.message,
                attemptsLeft: `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left`
            })
        }

        // ── Correct OTP ──
        user.wrongOtpAttempt = 0
        user.otpResendCount = 0
        user.temporaryLockUntil = null

        // ── save otpType BEFORE clearing ──
        const currentOtpType = user.otpType

        switch (currentOtpType) {

            case "register":
                user.isVerified = true
                await confimrationMail(user.email, user.username)
                break

            case "forgot-password":
                user.canResetPassword = true
                break

            case "login":
                user.isOnline = true
                break

            default:
                return res.status(400).json({
                    message: "Invalid OTP type!"
                })
        }

        // ── clear OTP fields AFTER switch ──
        user.otp = null
        user.otpExpiry = null
        user.otpType = null

        await user.save()

        // ── forgot-password: keep tempToken, redirect to reset-password ──
        if (currentOtpType === "forgot-password") {
            return res.status(200).json({
                message: "OTP verified! You can now reset your password."
            })
        }

        // ── register: clear cookie, redirect to login ──
        if (currentOtpType === "register") {
            clearTempCookie(res)
            return res.status(200).json({
                message: "Registration successful! Please login to continue."
            })
        }

        // ── login: create session ──
        if (currentOtpType === "login") {
            const { accessToken } = await createSession(user, req, res)
            clearTempCookie(res)

            return res.status(200).json({
                message: "Logged in successfully!",
                accessToken,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified
                }
            })
        }

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

/////////////////// RESEND OTP ///////////////////
async function resendOTP(req, res) {

    try {

        const user= req.user
        
        if(user.isVerified && user.otpType==="register" ){
            return res.status(400).json({
                message: "User already verified!"
            })
        }

        // ── Increment resend counter ──
        user.otpResendCount = (user.otpResendCount || 0) + 1

        if (user.otpResendCount > 5) {

            user.temporaryLockUntil = new Date(Date.now() + 30 * 60 * 1000)
            user.otpResendCount = 0
            await user.save()

         return res.status(403).json({
                code: "PROFILE_LOCKED",
                message: "Account locked for 30 mins: too many OTP resend requests."
            })
        }


        // Create New OTP
        const {
            otp,
            hashedOTP,
            otpExpiry
        } = await createOTP()

        // Update User
        user.otp = hashedOTP

        user.otpExpiry = otpExpiry

        await user.save()

        // Send Mail
        await sendEmail(

            user.email,

            otp,

            user.username,

            otpExpiry

        )

        // Response
        res.status(200).json({

            message:
            "OTP resent successfully!"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

///////////////////////// LOGIN //////////////////
//pw
async function login(req,res) {
    try {

        const {email,password} = req.body

        const user= await userModel.findOne({email})

//check in db if user saved
        if(!user){
            return res.status(404).json({
                message: "User email not found, Please register first!"
            })
        }

// //check already logged in or not
//         if(user.isOnline){
//             return res.status(404).json({
//                 message: "User already logged in!"
//             })
        // } 
//check if regisration verified
        if(!user.isVerified) {
            return res.status(404).json({
                message: "User is not verified!"
            })
        }
      
//now check if user acc in blocked or not//
    const blockStatus = await checkTempBlock(user)

if (blockStatus.blocked) {
    return res.status(429).json({
        code: "TEMP_BLOCKED",
        message: blockStatus.message
    })
}

if (blockStatus.expired) {
    user.temporaryLockUntil = null
    user.wrongPassAttempt = 0

    await user.save()
}


//check password method 1 of login
        const passMatch = await bcrypt.compare(password,user.password)
        
        if(!passMatch){

            user.wrongPassAttempt = (user.wrongPassAttempt || 0) + 1

            if(user.wrongPassAttempt >=3 ) {
                const{otp, hashedOTP,otpExpiry} = await createOTP()

                user.otp = hashedOTP
                user.otpExpiry = otpExpiry
                user.otpType= "login"
                user.wrongPassAttempt= 0

                await user.save()

                await sendEmail(user.email, otp, user.username, otpExpiry)

                const tempToken = generateTempToken(user._id)
                sendTempCookie(res, tempToken)

              
                return res.status(403).json({
                    code: "PASSWORD_ATTEMPTS_EXCEEDED",
                    message: "Too many wrong attempts. An OTP has been sent to your email for verification."
                })
            }

            await user.save()
            
            const attemptsLeft = 3 - user.wrongPassAttempt
            return res.status(401).json({
                message: "Wrong password!",
                attemptsLeft: `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left`
            })
        }
        
    // Correct password — reset counter
        user.wrongPassAttempt = 0
        user.isOnline = true
        await user.save()
     


        const { accessToken } = await createSession(user, req, res)

        return res.status(200).json({
             message: "Logged in successfully!",
             accessToken,
            user: {
               id: user._id,
               username: user.username,
               email: user.email
            }
        }) 
} 

catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }    
}

//otp
async function loginOTP(req,res) {
    try {
        const {email} = req.body

        const user= await userModel.findOne({email})

        if(!user) {
            return res.status(404).json({
                message: "User not found !!"
            })
        }


        if (!user.isVerified) {
            return res.status(400).json({
                message:
                "Please verify account first!"
            })
        }

// //check already logged in or not
//         if(user.isOnline){
//             return res.status(404).json({
//                 message: "User already logged in!"
//             })
//         } 

        const {otp,hashedOTP,otpExpiry} = await createOTP()


        user.otp = hashedOTP
        user.otpExpiry= otpExpiry
        user.otpType= "login"


        await user.save()
        

        await sendEmail(
            user.email,
            otp,
            user.username,
            otpExpiry
        ) 



                const tempToken = generateTempToken(user._id)
                sendTempCookie(res, tempToken)



        res.status(200).json({
            message:
            "Login OTP sent successfully!"
        })

    } 
    
    catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}



////////////////////GetMe///////////////////
async function getMe(req, res) {
    try {
        const user = req.user   // from verifyAccessToken middleware

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                isOnline: user.isOnline,
                role: user.role
            }
        })

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}



///////////////Forget PW//////////
async function forgotPassword(req, res) {
    try {
        const { email } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        
        }
        // ── using checkTempBlock util instead of manual check ──
        const blockStatus = await checkTempBlock(user)

        if (blockStatus.blocked) {
            return res.status(429).json({
                code: blockStatus.code,
                message: blockStatus.message
            })
        }

        if (blockStatus.expired) {
            user.temporaryLockUntil = null
            user.wrongOtpAttempt = 0
            await user.save()
        }

        const { otp, hashedOTP, otpExpiry } = await createOTP()

        user.otp = hashedOTP
        user.otpExpiry = otpExpiry
        user.otpType = "forgot-password"
        user.canResetPassword = false

        await user.save()

        await sendEmail(user.email, otp, user.username, otpExpiry)

        
        const tempToken = generateTempToken(user._id)
        sendTempCookie(res, tempToken)


        res.status(200).json({
            message: "Reset password verification mail sent!"
        })
    }
 
catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}


/////////////////////Reset PW///////////////
async function resetPassword(req,res) {
    try {

        const {newPassword} =req.body

        const user = req.user

        if(!user.canResetPassword) {
            return res.status(403).json({
            message: "OTP verification required!"
            })
        }

        const hashedPassword= await bcrypt.hash(newPassword,10)

        user.password=hashedPassword
        user.canResetPassword=false
        await user.save()


       clearTempCookie(res)


        res.status(200).json({
            message:
            "Password reset successful! Please login with your new password!"
        })
    } 
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


///////////////////////rotate token////////////
async function rotateRefreshToken(req,res) {
    
   try {
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken) {
        return res.status(401).json({
            message : "No refresh token found!"
        })
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    )

    if (decoded.type !== "refresh") {
            return res.status(401).json({
                message: "Invalid token type!"
            })
    }

    const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex")


    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked : false
    })  
    
    
    if (!session) {
        return res.status(401).json(
            {
                message: "Invalid session!"
            }
        )
    }

    
    const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found!"
            })
        }


    const newRefreshToken = generateRefreshToken (user._id)
    
    const newRefreshTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex")


    session.refreshTokenHash = newRefreshTokenHash
    await session.save()

    sendRefreshCookie(res, newRefreshToken);

    const newAccessToken = generateAccessToken(user._id,session._id)



    return res.status(200).json({
            message: "Token refreshed successfully!",
            accessToken: newAccessToken
        })

    } 
    
    catch (err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token!"
        })
    }
    
}


/////////////////// LOGOUT ///////////////////
async function logout(req, res) {

    try {
        // Find logged in user
        const user = req.user

        req.session.revoked = true;
        await req.session.save();


        // Set offline
        user.isOnline = false
        await user.save()

        clearAuthCookies(res)
         
        return res.status(200).json({
            message: "Logout successful!"
        })
    }

    catch (err) {
        return res.status(500).json({
            message: err.message
        })

    }

}


//////////////////logout all///////////
async function logOutAll(req,res) {
   
   try{ 
    const user = req.user
    
    const session = await sessionModel.updateMany(
        {user:user._id , revoked: false},
        {revoked: true}
    )


    clearAuthCookies(res)

    return res.status(201).json({
        message: "Logged Out successfully from all devices!"
    })

}

catch (err) {
        return res.status(500).json({ message: err.message })
    }
}



///////////////////





module.exports = {
    registerUser,
    verifyOTP,
    resendOTP,
    login,
    loginOTP,
    getMe,
    forgotPassword,
    resetPassword,
    rotateRefreshToken,
    logout,
    logOutAll
}