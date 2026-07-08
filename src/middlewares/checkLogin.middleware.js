const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

async function checkLogin(req,res,next) {
    
    try {

          // ── check via isOnline flag from email/password ──
        const { email } = req.body

        if (email) {
            const user = await userModel.findOne({ email })

            if (user && user.isOnline) {
                return res.status(400).json({
                    message: "User already logged in!"
                })
            }
        }


        const token = req.cookies.tempToken   
        
        if(!token) {
            return next()
        }

        jwt.verify(token, process.env.JWT_SECRET)

        return res.status(400).json({
            message:"User already logged in!!"
        })

    } 
    catch (error) {
        next()
    }

}


module.exports=checkLogin