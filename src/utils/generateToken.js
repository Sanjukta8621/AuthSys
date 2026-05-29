const jwt = require("jsonwebtoken")

function generateToken(id, expires="7d") {

    return jwt.sign(

        { id },

        process.env.JWT_SECRET,

        { expiresIn: expires }

    )

}

module.exports = generateToken