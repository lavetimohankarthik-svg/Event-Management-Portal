const participantDashboardService =
require("../services/participantDashboardService");

const getDashboard = async(req,res)=>{

try{

const dashboard=
await participantDashboardService.getDashboard(
req.user._id
);

res.json({

success:true,

dashboard

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

getDashboard

};