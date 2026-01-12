"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (error, req, res, next) => {
    console.error("❌ Error:", error.message);
    const statusCode = error.message.includes("déjà utilisé") ||
        error.message.includes("invalide") ||
        error.message.includes("requis") ||
        error.message.includes("au moins")
        ? 400
        : 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || "Une erreur est survenue",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
};
exports.errorMiddleware = errorMiddleware;
