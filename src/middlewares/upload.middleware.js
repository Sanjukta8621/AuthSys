const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: "AUTHSYS/avatars",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
             {
                width: 300,
                height: 300,
                crop: "fill",
            },
        ],
    }
})