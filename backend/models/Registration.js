const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        registrationStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "confirmed",
        },

        paymentStatus: {
            type: String,
            enum: ["free", "pending", "paid"],
            default: "free",
        },

        qrCode: {
            type: String,
            default: "",
        },

        ticketId: {
            type: String,
            unique: true,
        },

        formResponses: [
            {
                label: String,
                value: mongoose.Schema.Types.Mixed,
            }
        ],

        checkedIn: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Registration",
    registrationSchema
);