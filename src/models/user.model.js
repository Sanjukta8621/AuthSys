const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    otp: String,
    otpExpiry: Date,
    isVerified: {
        type: Boolean,
        default: false
    }

})

const userModel= mongoose.model("User", userSchema)



module.exports= userModel