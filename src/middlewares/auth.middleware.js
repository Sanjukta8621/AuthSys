const jwt= require("jsonwebtoken")
const userModel = require("../models/user.model")

async function verifyToken(req,res,next) {
try{
    const token = req.cookies.cookieToken
    
    if(!token) {
        return res.status(401).json({
            message: "Unauthorized!"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id)

    if(!user) {
        return res.status(401).json({
            message: "User not found!!"
        })
    }

    req.user = user

    next()
}

catch(error){
       return res.status(401).json({
            message: error.message
        })
}

}


module.exports = verifyToken