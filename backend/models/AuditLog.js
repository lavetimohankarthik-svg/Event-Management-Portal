const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Registration",
            required: true,
        },
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
            default: "MANUAL_CHECKIN",
        },
        details: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
