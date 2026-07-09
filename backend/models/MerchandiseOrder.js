const mongoose=require("mongoose");

const merchandiseOrderSchema=new mongoose.Schema({

    merchandise:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Merchandise",
        required:true
    },

    participant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    quantity:{
        type:Number,
        default:1
    },

    totalPrice:{
        type:Number,
        required:true
    },

    paymentScreenshot:{
        type:String,
        default:""
    },

    paymentStatus:{
        type:String,

        enum:[
            "Pending",
            "Approved",
            "Rejected"
        ],

        default:"Pending"
    },

    ticketId:{
        type:String,
        default:""
    },

    qrCode:{
        type:String,
        default:""
    }

},{
    timestamps:true
});

module.exports=
mongoose.model(
"MerchandiseOrder",
merchandiseOrderSchema
);