const {body, validationResult} = require("express-validator")

const registerValidator = [

    body("username")
    .trim()
    .isLength({min:3})
    .withMessage("Username must contain min 3 chars !"),

    body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please input a valid email !"),

    body("password")
   .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
   })
   .withMessage(
      "Password must contain uppercase, lowercase, number and special character"),
   

    (req, res, next) => {

      const errors =validationResult(req)

      if(!errors.isEmpty()){

         return res.status(400).json({
            success:false,
            errors: errors.array()[0].msg
         })
      }

      next()
   }
];

module.exports = registerValidator