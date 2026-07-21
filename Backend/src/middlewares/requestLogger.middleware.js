// middlewares/requestLogger.middleware.js
const logger = require("../utils/logger")

function requestLogger(req, res, next) {

    const start = Date.now()

    // runs after response is sent
    res.on("finish", () => {
        const duration = Date.now() - start

        logger.http(
            `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${req.ip}`
        )
    })

    next()
}

module.exports = requestLogger