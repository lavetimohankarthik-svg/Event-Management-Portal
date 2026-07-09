const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true,
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isRegistered: {
            type: Boolean,
            default: false,
        },

        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Registration",
            default: null,
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        maxMembers: {
            type: Number,
            default: 4,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Team", teamSchema);