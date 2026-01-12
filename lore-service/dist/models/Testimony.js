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
const types_1 = require("../types");
const testimonySchema = new mongoose_1.Schema({
    creatureId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Creature",
        required: [true, "Creature ID is required"],
        index: true,
    },
    authorId: {
        type: String,
        required: [true, "Author ID is required"],
        index: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
        type: String,
        enum: {
            values: Object.values(types_1.TestimonyStatus),
            message: "{VALUE} is not a valid status",
        },
        default: types_1.TestimonyStatus.PENDING,
        index: true,
    },
    validatedBy: {
        type: String,
        default: null,
    },
    validatedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
// Index composés pour optimiser les requêtes
testimonySchema.index({ creatureId: 1, status: 1 });
testimonySchema.index({ authorId: 1, creatureId: 1 });
testimonySchema.index({ authorId: 1, createdAt: -1 });
testimonySchema.index({ status: 1, createdAt: -1 });
exports.default = mongoose_1.default.model("Testimony", testimonySchema);
