const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["participant", "organizer", "admin"],
            default: "participant",
        },

        participantType: {
            type: String,
            enum: ["NIT DURGAPUR", "External"],
            default: "External",
        },

        collegeName: {
            type: String,
            trim: true,
            default: "",
        },

        phoneNumber: {
            type: String,
            default: "",
        },

        profileImage: {
            type: String,
            default: "",
        },

        interests: {
            type: [String],
            default: [],
        },

        followedOrganizers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        organizationName: {
            type: String,
            default: ""
        },

        organizationDescription: {
            type: String,
            default: ""
        },

        organizationLogo: {
            type: String,
            default: ""
        },

        website: {
            type: String,
            default: ""
        },

        instagram: {
            type: String,
            default: ""
        },

        linkedin: {
            type: String,
            default: ""
        },

        contactEmail: {
            type: String,
            default: ""
        },

        contactPhone: {
            type: String,
            default: ""
        },

        discordWebhook: {
            type: String,
            default: ""
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);