const AppError = require("./utils/AppError")
const express = require("express")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const errorHandler = require("./middlewares/errorHandler.middleware")
const authRouter = require("./routes/auth.routes")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

app.use("/api/auth", authRouter)

// ── 404 handler — must be after all routes ──
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// ── global error handler — must be LAST ──
app.use(errorHandler)

module.exports = app