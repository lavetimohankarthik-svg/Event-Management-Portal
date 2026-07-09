const mongoose = require("mongoose");

const passwordResetRequestSchema = new mongoose.Schema({

    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reason: {
        type: String,
        default: ""
    },

    requestedPassword: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected"
        ],
        default: "Pending"
    },

    requestedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "PasswordResetRequest",
    passwordResetRequestSchema
);