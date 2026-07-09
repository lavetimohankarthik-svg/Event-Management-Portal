const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
{
    title:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        default:null
    },

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    targetAudience:{
        type:String,
        enum:[
            "ALL",
        "EVENT_PARTICIPANTS",
        "NIT_DURGAPUR_ONLY",
        "EXTERNAL_ONLY",
        "PARTICIPANT",
        "ORGANIZER",
        "ADMIN"
        ],
        default:"ALL"
    }

},
{
    timestamps:true
});

module.exports =
mongoose.model("Notification",notificationSchema);