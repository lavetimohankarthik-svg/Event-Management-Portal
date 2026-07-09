const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
{
    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event",
        required:true
    },

    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    message:{
        type:String,
        required:true,
        trim:true
    },

    replies:[
        {
            author:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },

            message:String,

            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]
},
{
    timestamps:true
});

module.exports=
mongoose.model("Discussion",discussionSchema);