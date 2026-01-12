"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationAction = exports.TestimonyStatus = void 0;
/**
 * Statuts possibles d'un témoignage
 */
var TestimonyStatus;
(function (TestimonyStatus) {
    TestimonyStatus["PENDING"] = "PENDING";
    TestimonyStatus["VALIDATED"] = "VALIDATED";
    TestimonyStatus["REJECTED"] = "REJECTED";
})(TestimonyStatus || (exports.TestimonyStatus = TestimonyStatus = {}));
/**
 * Actions de modération possibles (MOD-2)
 */
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["VALIDATE"] = "VALIDATE";
    ModerationAction["REJECT"] = "REJECT";
    ModerationAction["DELETE"] = "DELETE";
    ModerationAction["RESTORE"] = "RESTORE";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
