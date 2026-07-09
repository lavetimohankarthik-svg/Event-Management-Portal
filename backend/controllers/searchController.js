const searchService =
require("../services/searchService");

const globalSearch =
async(req,res)=>{

try{

const result =
await searchService.globalSearch(

req.query.query

);

res.json({

success:true,

result

});

}

catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

module.exports={

globalSearch

};