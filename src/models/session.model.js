const mongoose = require("mongoose")

const sessionSchema= new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    refreshTokenHash: {
        type: String,
        required: [true, "Refresh token is required!"],
    },

    ip: {
        type: String,
        required: [true, "ip not there!"]
    },

    userAgent: {
        type: String,
        required: [true, "userAgent not there!"]
    },
    revoked: {
        type: Boolean,
        default:false
    }
},
{timestamps: true})


const sessionModel = mongoose.model("sessions", sessionSchema)




module.exports= sessionModel