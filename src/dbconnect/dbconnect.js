const mongoose = require("mongoose")



async function dbConnect() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to db")
    }
    catch (e) {
        console.log(e)
    }
} 



module.exports= dbConnect
