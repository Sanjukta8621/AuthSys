const express = require("express")

const authController = require("../controllers/auth.controller")

const routes = express.Router()

routes.post("/register", authController.registerUser)

routes.post("/verify-otp", authController.verfyOTP)

module.exports = routes