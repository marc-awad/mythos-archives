"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const creatureSchema = new mongoose_1.Schema({
    authorId: {
        type: String,
        required: [true, "Author ID is required"],
        index: true, // Index pour optimiser les recherches par auteur
    },
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: true,
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    origin: {
        type: String,
        trim: true,
        maxlength: [200, "Origin cannot exceed 200 characters"],
    },
    legendScore: {
        type: Number,
        default: 1,
        min: [1, "Legend score cannot be less than 1"],
    },
}, {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
// Index composé pour optimiser les recherches
creatureSchema.index({ name: 1 }); // Déjà assuré par unique: true
creatureSchema.index({ legendScore: -1 }); // Pour trier par score
creatureSchema.index({ authorId: 1, createdAt: -1 }); // Pour récupérer les créatures d'un auteur
// Méthode virtuelle pour obtenir le nombre de témoignages (optionnel)
creatureSchema.virtual("testimonies", {
    ref: "Testimony",
    localField: "_id",
    foreignField: "creatureId",
});
exports.default = mongoose_1.default.model("Creature", creatureSchema);
