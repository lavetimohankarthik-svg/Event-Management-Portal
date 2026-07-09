const uploadFile = async(req,res)=>{

try{

res.json({

success:true,

url:req.file.path

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

uploadFile

};