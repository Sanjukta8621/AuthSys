const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const createOTP = require("../utils/createOTP")
const sendEmail = require("../utils/email")
const verifyOTPUtil = require("../utils/verifyOTP")
const confimrationMail= require("../utils/confirmationMail")
const generateToken= require("../utils/generateToken")
const sendCookie= require("../utils/sendCookie")
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

        // Get Token
        const token = req.cookies.cookieToken

        if (!token) {

            return res.status(401).json({

                message: "Unauthorized!"

            })

        }

        // Decode Token
        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        )

        // Find User
        const user = await userModel.findById(decoded.id)

        if (!user) {

            return res.status(404).json({

                message: "User not found!"

            })

        }

        // Verify OTP
        const otpResult = await verifyOTPUtil(user, otp)

        if (!otpResult.success) {
            return res.status(400).json({
                message: otpResult.message
            })
        }


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

        const { email } = req.body

        // Find User
        const user =
        await userModel.findOne({ email })

        // Check User
        if (!user) {

            return res.status(404).json({

                message: "User not found!"

            })

        }

        // Already Verified
        if (user.isVerified) {

            return res.status(400).json({

                message:
                "User already verified!"

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
//check password method 1 of login
        const passMatch = await bcrypt.compare(password,user.password)
        
        if(!passMatch){
            return res.status(404).json({
                message: "Wrong password !"
            })
        }

//set user as online
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

        const {otp,hashedOTP,otpExpiry} = await createOTP()

// Forgot Password OTP
        if(user.otpType === "forgot-password") {
         user.canResetPassword = true
        }

        user.otp= hashedOTP
        user.otpExpiry= otpExpiry
        user.otpType = "forgot-password"

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