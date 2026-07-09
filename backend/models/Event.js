const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        eventName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        eventCategory: {
            type: String,
            enum: ["technical", "cultural", "sports", "workshop", "seminar", "merchandise", "other"],
            required: true,
        },

        registrationType: {
            type: String,
            enum: ["individual", "team"],
            default: "individual",
        },

        minTeamSize: {
            type: Number,
            default: 1,
        },

        maxTeamSize: {
            type: Number,
            default: 1,
        },

        eligibility: {
            type: String,
            enum: [
                "All",
                "NIT_DURGAPUR_ONLY",
                "EXTERNAL_ONLY"
            ],
            default: "All",
        },

        registrationDeadline: {
            type: Date,
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline", "Hybrid"],
            default: "Offline",
        },

        venue: {
            type: String,
            default: "",
        },

        prizePool: {
            type: Number,
            default: 0,
        },

        rules: {
            type: [String],
            default: [],
        },

        coordinators: [
            {
                name: {
                    type: String,
                    required: true,
                },
                phone: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    default: "",
                },
            },
        ],

        brochure: {
            type: String,
            default: ""
        },

        registrationLimit: {
            type: Number,
            default: 100,
        },

        registrationFee: {
            type: Number,
            default: 0,
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        eventTags: {
            type: [String],
            default: [],
        },

        customFields: [
            {
                label: {
                    type: String,
                    required: true,
                },

                fieldType: {
                    type: String,
                    enum: [
                        "text",
                        "number",
                        "email",
                        "textarea",
                        "dropdown",
                        "checkbox",
                        "radio",
                        "file"
                    ],
                    required: true,
                },

                options: {
                    type: [String],
                    default: [],
                },

                required: {
                    type: Boolean,
                    default: false,
                },

                order: {
                    type: Number,
                    default: 0,
                }
            }
        ],

        formLocked: {
            type: Boolean,
            default: false,
        },

        bannerImage: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["draft", "published", "ongoing", "completed", "cancelled"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Event", eventSchema);