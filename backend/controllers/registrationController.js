const registrationService =
require("../services/registrationService");

const register = async (req, res) => {

    try{

        const registration =
        await registrationService.registerForEvent(
            req.user._id,
            req.params.eventId,
            req.body.formResponses
        );

        res.status(201).json({
            success:true,
            message:"Registration Successful",
            registration
        });

    }

    catch(error){

        res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

const approve = async (req, res) => {
    try {
        const registration = await registrationService.approveRegistration(
            req.params.id,
            req.user._id
        );

        res.json({
            success: true,
            registration,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports={
    register,
    approve
};