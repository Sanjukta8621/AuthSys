const AppError = require("./utils/AppError")
const helmet = require("helmet")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")
const hpp = require("hpp")
const express = require("express")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const errorHandler = require("./middlewares/errorHandler.middleware")
const authRouter = require("./routes/auth.routes")
const { globalLimiter, authLimiter } = require("./middlewares/rateLimiter.middleware")
const logger = require("./utils/logger")
const requestLogger = require("./middlewares/requestLogger.middleware")
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");


const app = express()

//security header
app.use(helmet({
    contentSecurityPolicy: false   // swagger UI needs inline scripts
}))


//cors
app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGIN
        : "http://localhost:5173",
    credentials: true
}))

//global rate limiter
app.use(globalLimiter)

//body parsing
app.use(express.json({limit:"30kb"}))
app.use(cookieParser())

//parameter pollution prevention
app.use(hpp())

//request logger
app.use(requestLogger)

//morgan
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}


//swagger
app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
);

app.use("/api/v1/auth", authLimiter, authRouter)

// ── 404 handler — must be after all routes ──
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// ── global error handler — must be LAST ──
app.use(errorHandler)


module.exports = app