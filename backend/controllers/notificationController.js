const notificationService =
require("../services/notificationService");

const createNotification =
async(req,res)=>{

try{

const notification=
await notificationService.createNotification(
req.user._id,
req.body
);

res.status(201).json({

success:true,

notification

});

}

catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};

const getNotifications=
async(req,res)=>{

try{

const notifications=
await notificationService.getNotifications();

res.json({

success:true,

notifications

});

}

catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};

module.exports={

createNotification,

getNotifications

};