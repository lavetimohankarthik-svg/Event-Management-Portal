const feedbackService =
require("../services/feedbackService");

const submitFeedback = async(req,res)=>{

try{

const feedback=
await feedbackService.submitFeedback(

req.user._id,

req.body

);

res.status(201).json({

success:true,

feedback

});

}

catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};

const getEventFeedback = async(req,res)=>{

try{

const result=
await feedbackService.getEventFeedback(

req.params.eventId

);

res.json({

success:true,

result

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

submitFeedback,

getEventFeedback

};