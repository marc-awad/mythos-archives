"use strict";
// lore-service/src/models/ModerationLog.ts
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
exports.TargetType = exports.ModerationAction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * MOD-2: Enum des actions de modération
 */
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["VALIDATE"] = "validate";
    ModerationAction["REJECT"] = "reject";
    ModerationAction["DELETE"] = "delete";
    ModerationAction["RESTORE"] = "restore";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
/**
 * MOD-2: Enum des types de cibles
 */
var TargetType;
(function (TargetType) {
    TargetType["TESTIMONY"] = "testimony";
    TargetType["CREATURE"] = "creature";
})(TargetType || (exports.TargetType = TargetType = {}));
const moderationLogSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: [true, "User ID is required"],
        index: true,
    },
    action: {
        type: String,
        enum: {
            values: Object.values(ModerationAction),
            message: "{VALUE} is not a valid moderation action",
        },
        required: [true, "Action is required"],
        index: true,
    },
    targetId: {
        type: String,
        required: [true, "Target ID is required"],
        index: true,
    },
    targetType: {
        type: String,
        enum: {
            values: Object.values(TargetType),
            message: "{VALUE} is not a valid target type",
        },
        required: [true, "Target type is required"],
        index: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Seulement createdAt
    collection: "moderation_logs",
});
// Index composés pour optimiser les requêtes fréquentes
moderationLogSchema.index({ userId: 1, timestamp: -1 });
moderationLogSchema.index({ targetId: 1, timestamp: -1 });
moderationLogSchema.index({ action: 1, timestamp: -1 });
moderationLogSchema.index({ targetType: 1, action: 1, timestamp: -1 });
exports.default = mongoose_1.default.model("ModerationLog", moderationLogSchema);
