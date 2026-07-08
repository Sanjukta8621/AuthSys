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
    },

    wrongOtpAttempt:{
        type: Number,
        default:0
    },

    otpResendCount: {
        type: Number,
        default: 0
    },

    temporaryLockUntil: {
        type: Date,
        default: null
    },

    wrongPassAttempt: {
        type: Number,
        default: 0
    }

},
{ timestamps: true })


//adding indedx for auto deletion of unverified users in db

userSchema.index(
    {createdAt: 1},
    {
        expireAfterSeconds : 60*60*24,  //after 24 hours of being unverified
        partialFilterExpression: {isVerified: false}  //only deletes unverified users
    }
)

const userModel= mongoose.model("User", userSchema)



module.exports= userModel