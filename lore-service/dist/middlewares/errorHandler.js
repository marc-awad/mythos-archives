"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    // Erreur de validation Mongoose
    if (err instanceof mongoose_1.Error.ValidationError) {
        res.status(400).json({
            error: "Erreur de validation",
            details: err.message,
        });
        return;
    }
    // Erreur de duplication (unique constraint)
    if (err.code === 11000) {
        res.status(409).json({
            error: "Conflit: cette ressource existe déjà",
        });
        return;
    }
    // Erreur générique
    res.status(err.status || 500).json({
        error: err.message || "Erreur serveur interne",
    });
};
exports.errorHandler = errorHandler;
