const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({

    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },

    feedback: {
        type: String,
        required: true
    }

},{
    timestamps:true
});

// One feedback per participant per event
feedbackSchema.index(
    {
        participant:1,
        event:1
    },
    {
        unique:true
    }
);

module.exports =
mongoose.model("Feedback",feedbackSchema);