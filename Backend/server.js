require("dotenv").config()
const app = require("./src/app")
const dbConnect = require("./src/config/db")
const logger = require("./src/utils/logger")

const PORT = process.env.PORT || 4000

dbConnect().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
    })
}).catch((err) => {
    logger.error(`Failed to connect to DB: ${err.message}`)
    process.exit(1)
})