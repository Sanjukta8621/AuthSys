const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const generateOTP = require("../utils/OTPgenerator")
const sendEmail = require("../utils/email")
const bcrypt= require("bcrypt")



/////////////////// REGISTER USER ///////////////////

async function registerUser(req, res) {

    try {

        const { username, email, password } = req.body

        // Check existing user
        const isUserAlreadyPresent = await userModel.findOne({
            email
        })

        if (isUserAlreadyPresent) {

            return res.status(409).json({
                message: "User email already exists! Try a new email."
            })

        }

        // Generate OTP
        const otp = generateOTP()
        const hashOTP= await bcrypt.hash(otp,10)

        // OTP Expiry Time (5 mins)
        const otpExpiry = Date.now() + 5 * 60 * 1000

        // Create User
        const user = await userModel.create({

            username,

            email,

            password,

            otp:hashOTP,

            otpExpiry,

            isVerified: false

        })

        // Send OTP Email
        await sendEmail(email, otp, username)

        // Temporary Token
        const token = jwt.sign(

            {
                id: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "10m"
            }

        )

        // Store Token In Cookie
        res.cookie("cookieToken", token, {

            httpOnly: true

        })

        // Final Response
        res.status(200).json({

            message: "OTP sent to email successfully!"

        })

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}



/////////////////// VERIFY OTP ///////////////////

async function verfyOTP(req, res) {

    try {

        const { otp } = req.body

        // Get Cookie Token
        const token = req.cookies.cookieToken

        // Check Token
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

        // Check User
        if (!user) {

            return res.status(404).json({

                message: "User not found!"

            })

        }

        // Check OTP
        const isValidOTP= await bcrypt.compare(otp, user.otp)

        if(!isValidOTP){
            return res.status(400).json({
                message: `Invalid OTP entered!!6`
            })
        }

        // Check OTP Expiry
        if (user.otpExpiry < Date.now()) {

            console.log("Entered expired OTP:", otp )


            return res.status(400).json({

                message: "OTP expired!"

            })

        }

        // Verify User
        user.isVerified = true

        // Remove OTP
        user.otp = null

        user.otpExpiry = null

        // Save User
        await user.save()

        // Final Login Token
        const finalToken = jwt.sign(

            {
                id: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        )

        // Store Final Token
        res.cookie("cookieToken", finalToken, {

            httpOnly: true

        })

        // Response
        res.status(200).json({

            message: "Email verified successfully!",

            user

        })

    }

    catch (err) {

        console.log(err)

        res.status(500).json({

            message: err.message

        })

    }

}



module.exports = {

    registerUser,

    verfyOTP

}