const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 8
    },
    otp: String,
    otpExpiry: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    otpType: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    canResetPassword: {
    type: Boolean,
    default: false
    }

})

const userModel= mongoose.model("User", userSchema)



module.exports= userModel