const jwt = require("jsonwebtoken")

async function checkLogin(req,res,next) {
    
    try {
        const token = req.cookies.cookieToken
        
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