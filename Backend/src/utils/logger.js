// utils/logger.js
const winston = require("winston")

// define log levels and their colors for console
const levels = {
    error: 0,
    warn:  1,
    info:  2,
    http:  3,
    debug: 4
}

const colors = {
    error: "red",
    warn:  "yellow",
    info:  "green",
    http:  "magenta",
    debug: "white"
}

winston.addColors(colors)

// in production — only show warn and above
// in development — show everything including debug
const level = () => {
    const isDev = process.env.NODE_ENV === "development"
    return isDev ? "debug" : "warn"
}

// format for console — colorized, human readable
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}`
    )
)

// format for files — JSON, machine readable
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
)

const logger = winston.createLogger({
    level: level(),
    levels,
    transports: [
        // console — all logs
        new winston.transports.Console({
            format: consoleFormat
        }),

        // file — only errors
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat
        }),

        // file — all logs
        new winston.transports.File({
            filename: "logs/combined.log",
            format: fileFormat
        })
    ]
})

module.exports = logger