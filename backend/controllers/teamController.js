const teamService = require("../services/teamService");

const createTeam = async (req, res) => {
  try {
    const team = await teamService.createTeam(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Team Created Successfully",
      team,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await teamService.getTeams();

    res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTeam = async (req, res) => {

    try{

        await teamService.deleteTeam(
            req.params.id,
            req.user._id
        );

        res.json({
            success:true,
            message:"Team Deleted"
        });

    }

    catch(error){

        res.status(400).json({
            success:false,
            message:error.message
        });

    }

};

module.exports = {
  createTeam,
  getTeams,
  deleteTeam,
};