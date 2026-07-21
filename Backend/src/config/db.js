const mongoose = require("mongoose")
const logger = require("../utils/logger")

async function dbConnect() {
    await mongoose.connect(process.env.MONGODB_URL)
    logger.info(`Connected to MongoDB — ${mongoose.connection.name}`)
}

module.exports = dbConnect