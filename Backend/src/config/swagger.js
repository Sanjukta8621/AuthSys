// src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "AuthSys API",
            version: "1.0.0",
            description: "Authentication & Authorization API — Node.js, Express, MongoDB"
        },

        servers: [
            { url: "http://localhost:4000", description: "Development server" }
            
          //  {url: "https://your-app-name.onrender.com", description: "Production server"}
        ],

        components: {

            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Access token — get from login or verify-otp response"
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "refreshToken",
                    description: "Refresh token — set automatically in httpOnly cookie"
                },
                tempCookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "tempToken",
                    description: "Temp token — set after register/login/forgot-password"
                }
            },

            schemas: {

                // ── Register ──────────────────────────────────────
                RegisterRequest: {
                    type: "object",
                    required: ["username", "email", "password"],
                    properties: {
                        username: { type: "string", example: "Sanjukta", minLength: 3 },
                        email: { type: "string", format: "email", example: "test@gmail.com" },
                        password: { type: "string", example: "Test@1234", minLength: 8 },
                        avatar: { type: "string", format: "binary", description: "Profile image (optional)" }
                    }
                },

                // ── OTP ───────────────────────────────────────────
                VerifyOTPRequest: {
                    type: "object",
                    required: ["otp"],
                    properties: {
                        otp: { type: "string", example: "123456", minLength: 6, maxLength: 6 }
                    }
                },

                // ── Login ─────────────────────────────────────────
                PasswordLoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email", example: "test@gmail.com" },
                        password: { type: "string", example: "Test@1234" }
                    }
                },

                OTPLoginRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string", format: "email", example: "test@gmail.com" }
                    }
                },

                // ── Password ──────────────────────────────────────
                ForgotPasswordRequest: {
                    type: "object",
                    required: ["email"],
                    properties: {
                        email: { type: "string", format: "email", example: "test@gmail.com" }
                    }
                },

                ResetPasswordRequest: {
                    type: "object",
                    required: ["newPassword", "confirmPassword"],
                    properties: {
                        newPassword: { type: "string", example: "NewPass@1234" },
                        confirmPassword: { type: "string", example: "NewPass@1234" }
                    }
                },

                // ── Responses ─────────────────────────────────────
                SuccessResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Operation successful!" }
                    }
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Something went wrong!" }
                    }
                },

                UserResponse: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        username: { type: "string", example: "Sanjukta" },
                        email: { type: "string", example: "test@gmail.com" },
                        isVerified: { type: "boolean", example: true },
                        isOnline: { type: "boolean", example: true },
                        role: { type: "string", example: "user" },
                        avatar: { type: "string", example: "https://res.cloudinary.com/..." }
                    }
                },

                LoginSuccessResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Logged in successfully!" },
                        accessToken: { type: "string", example: "eyJhbGci..." },
                        user: { $ref: "#/components/schemas/UserResponse" }
                    }
                }
            }
        }
    },

    apis: ["./src/swaggerDocs/*.js"]
}

const swaggerSpec = swaggerJsdoc(options)
module.exports = swaggerSpec