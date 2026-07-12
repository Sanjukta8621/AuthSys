require("dotenv").config()
const app= require("./src/app")
const dbConnect= require("./src/config/db")


app.listen(4000, ()=> {
    console.log("Server running successfully!!")
})

dbConnect()

