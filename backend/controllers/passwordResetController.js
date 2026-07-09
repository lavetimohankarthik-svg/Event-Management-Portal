const passwordResetService =
require("../services/passwordResetService");

const createRequest = async(req,res)=>{

    try{

        const request =
        await passwordResetService.createRequest(

            req.user._id,

            req.body.reason,

            req.body.newPassword

        );

        res.status(201).json({

            success:true,

            request

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};

const getRequests = async(req,res)=>{

    try{

        const requests =
        await passwordResetService.getRequests();

        res.json({

            success:true,

            requests

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};

const approveRequest = async(req,res)=>{

    try{

        const { request, temporaryPassword } =
        await passwordResetService.approveRequest(

            req.params.id

        );

        res.json({

            success:true,

            request,

            temporaryPassword

        });

    }

    catch(error){

        res.status(400).json({

            success:false,

            message:error.message

        });

    }

};

const rejectRequest = async(req,res)=>{

    try{

        const request =
        await passwordResetService.rejectRequest(

            req.params.id

        );

        res.json({

            success:true,

            request

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

    createRequest,

    getRequests,

    approveRequest,

    rejectRequest

};