const teamRegistrationService =
require("../services/teamRegistrationService");

const registerTeam = async (req, res) => {

    try{

        const registration =
        await teamRegistrationService.registerTeam(
            req.user._id,
            req.params.teamId,
            req.params.eventId
        );

        res.status(201).json({

            success:true,

            message:"Team Registered Successfully",

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

module.exports={
    registerTeam
};