const exportService =
require("../services/exportService");

const exportParticipants =
async(req,res)=>{

try{

const csv=
await exportService.exportParticipants(

req.params.eventId

);

res.header(
"Content-Type",
"text/csv"
);

res.attachment("participants.csv");

res.send(csv);

}

catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};

module.exports={

exportParticipants

};