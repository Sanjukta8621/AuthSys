const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const createOTP = require("../utils/createOTP")
const sendEmail = require("../utils/email")
const verifyOTPUtil = require("../utils/otpVerification")
const confimrationMail= require("../utils/confirmationMail")
const generateToken= require("../utils/generateToken")
const sendCookie= require("../utils/sendCookie")
const checkTempBlock = require("../utils/checkTempBlock")
const bcrypt= require("bcryptjs")


/////////////////// REGISTER USER ///////////////////
async function registerUser(req, res) {

    try {

        const { username, email, password } = req.body

        // Check existing user
        const isUserAlreadyPresent =
        await userModel.findOne({ email })

        if (isUserAlreadyPresent) {

            return res.status(409).json({
                message:
                "User email already exists!"
            })

        }

        //pw hashing
        const hashedPass= await bcrypt.hash(password,10)

        // Create OTP
        const {
            otp,
            hashedOTP,
            otpExpiry
        } = await createOTP()

        // Create User
        const user = await userModel.create({

            username,
            email,
            password: hashedPass,
            otp: hashedOTP,
            otpExpiry,
            isVerified: false,
            otpType: "register"

        })

        // Send Email
        await sendEmail(
            email,
            otp,
            username,
            otpExpiry
        ) 

        // Temporary Token
       const token = generateToken(user._id, "10m")


        // Cookie
       sendCookie(res, token)

        // Response
        res.status(200).json({

            message:
            "OTP sent to email successfully!"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

/////////////////// VERIFY OTP ///////////////////
async function verifyOTP(req, res) {
    try {

        const { otp } = req.body

        // req.user comes from otpLimiter middleware — no need to fetch again
        const user = req.user

        const otpResult = await verifyOTPUtil(user, otp)

        if (!otpResult.success) {

            // ── Wrong OTP: increment counter ──
            user.otpWrongAttempts = (user.otpWrongAttempts || 0) + 1

            if (user.otpWrongAttempts >= 3) {
                user.tempBlockedUntil = new Date(Date.now() + 30 * 60 * 1000)
                user.otpWrongAttempts = 0
                await user.save()

                return res.status(429).json({
                    code: "TEMP_BLOCKED",
                    message: "Too many wrong attempts. Account blocked for 30 minutes."
                })
            }

            await user.save()

            const attemptsLeft = 3 - user.otpWrongAttempts
            return res.status(400).json({
                message: otpResult.message,
                attemptsLeft: `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left`
            })
        }

        // ── Correct OTP: reset all counters ──
        user.otpWrongAttempts = 0
        user.otpResendCount = 0
        user.tempBlockedUntil = null
        
 // OTP TYPE HANDLER

        switch (user.otpType) {

            // Registration OTP
            case "register":
                user.isVerified = true
                user.isOnline = true

                await confimrationMail(
                    user.email,
                    user.username
                )
                break


            // Forgot Password OTP
            case "forgot-password":
                user.canResetPassword = true
                break


            // Login OTP
            case "login":
                user.isOnline = true
                break

            // Invalid OTP Type
            default:
                return res.status(400).json({
                    message: "Invalid OTP type!"
                })
        }


// Remove OTP
        user.otp = null
        user.otpExpiry = null
        user.otpType = null


        await user.save()


// Final Login Token
       const finalToken = generateToken(user._id)


// Cookie
       sendCookie(res, finalToken)


// Response
        res.status(200).json({

            message:
            "Email verified successfully!",

            user: {

                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified

            }

        })

    }
    catch (err) {

        res.status(500).json({

            message: err.message

        })

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
//check if regisration verified
        if(!user.isVerified) {
            return res.status(404).json({
                message: "User is not verified!"
            })
        }
      
//now check if user acc in blocked or not//
        const {blocked, expired} = await checkTempBlock(user)

        if(blocked) {
            return res.status(429).json({
                code: "TEMP_BLOCKED",
                message: blockStatus.message
            })
        }

        if(expired){
            user.temporaryLockUntill= null
            user.wrongPassEntered= 0

            await user.save()
        }


//check password method 1 of login
        const passMatch = await bcrypt.compare(password,user.password)
        
        if(!passMatch){

            user.wrongPassEntered = (user.wrongPassEntered || 0) + 1

            if(user.wrongPassEntered >=3 ) {
                const{otp, hashedOTP,otpExpiry} = createOTP()

                user.otp = hashedOTP
                user.otpExpiry = otpExpiry
                user.otpType= "login"
                user.wrongPassEntered= 0

                await user.save()

                await sendEmail(user.email, otp, user.username, otpExpiry)

                const token = generateToken(user._id, "10m")
                sendCookie(res, token)

              
                res.status(403).json({
                    code: "PASSWORD_ATTEMPTS_EXCEEDED",
                    message: "Too many wrong attempts. An OTP has been sent to your email for verification."
                })
            }

            await user.save()
            
            const attemptsLeft = 3 - user.passwordWrongAttempts
            return res.status(401).json({
                message: "Wrong password!",
                attemptsLeft: `${attemptsLeft} attempt${attemptsLeft > 1 ? "s" : ""} left`
            })
        }
        
    // Correct password — reset counter
        user.passwordWrongAttempts = 0
        user.isOnline = true
        await user.save()
     

// Temporary Token
       const token = generateToken(user._id, "10m")


// Cookie
       sendCookie(res, token)

// Response
        res.status(200).json({
            message:
            "User logged in successfully!"
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

//set user as online
    user.isOnline = true
    await user.save()  


// Temporary Token
       const token = generateToken(user._id, "10m")


// Cookie
       sendCookie(res, token)



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

/////////////////// LOGOUT ///////////////////
async function logout(req, res) {

    try {
        // Find logged in user
        const user = req.user
        // Set offline
        user.isOnline = false
        await user.save()

        res.clearCookie("cookieToken")
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

///////////////Forget PW//////////
async function forgotPassword(req,res) {
    try {
        const {email} = req.body
        
        const user= await userModel.findOne({email})

        if(!user) {
            return res.status(404).json({
                message: "User not found !!"
            })
        }

        if(user.isProfileLocked){
            return res.status(403).json({
                message: "User profile locked !!"
            }) 
        }

        if(user.temporaryLockUntill && user.temporaryLockUntill>new Date()){

            const timeLeft= Math.ceil((user.temporaryLockUntill - new Date()) /60000)
            return res.status(403).json({
                code: "TEMP_BLOCKED",
                message: `Account blocked. Try again in ${timeLeft} minute${timeLeft > 1 ? "s" : ""}.`
            })
             
        }

        const {otp,hashedOTP,otpExpiry} = await createOTP()

        user.otp = hashedOTP
        user.otpExpiry = otpExpiry
        user.otpType = "forgot-password"
        user.canResetPassword = false

        await user.save()

        await sendEmail(user.email, otp, user.username, otpExpiry)

        res.status(200).json({
            message: "Reset password verification mail send !"
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

        const {email,newPassword} =req.body

        const user= await userModel.findOne({email})

        if(!user) {
            return res.status(404).json({
                message: "User not found !!"
            })
        }

        if(!user.canResetPassword) {
            return res.status(403).json({
            message: "OTP verification required!"
            })
        }

        const hashedPassword= await bcrypt.hash(newPassword,10)

        user.password=hashedPassword
        user.canResetPassword=false
        await user.save()

        res.status(200).json({
            message:
            "Password reset successful!"
        })
    } 
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}




module.exports = {
    registerUser,
    verifyOTP,
    resendOTP,
    login,
    loginOTP,
    logout,
    forgotPassword,
    resetPassword
}