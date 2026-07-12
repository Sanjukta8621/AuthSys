const multer = require("multer")
const path = require("path")
const cloudinary = require("../config/cloudinary")
const fs = require("fs")


// create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// ── save to local disk first ──
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only jpg, jpeg, png and webp allowed!"), false)
        }
        cb(null, true)
    }
})

// ── upload local file to cloudinary then delete local copy ──
async function uploadAvatar(req, res, next) {
    upload.single("avatar")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message })
        }

        // no file — skip
        if (!req.file) return next()

        try {
            // upload local file to cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "authsys/avatars",
                transformation: [{ width: 300, height: 300, crop: "fill" }]
            })

            // delete local file after cloudinary upload
            fs.unlinkSync(req.file.path)

            // attach cloudinary result to req.file
            req.file.path = result.secure_url
            req.file.filename = result.public_id

            next()

        } catch (error) {
            // delete local file if cloudinary fails
            if (req.file?.path) fs.unlinkSync(req.file.path)
            return res.status(500).json({ message: "Image upload failed!" })
        }
    })
}

module.exports = uploadAvatar